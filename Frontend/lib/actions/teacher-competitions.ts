'use server'

import { requireTeacher, requireUser } from './utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// --- Validation Schemas ---

const CreateCompetitionSchema = z.object({
    classroomId: z.string().uuid(),
    title: z.string().min(3, 'Competition title must be at least 3 characters'),
    description: z.string().optional(),
    selectedProblems: z.array(z.string().uuid()).optional(),
    durationMinutes: z.number().min(30).max(480).default(120),
    maxParticipants: z.number().min(1).max(500).default(100),
    isQuizMode: z.boolean().default(false),
    isBattleTest: z.boolean().default(false),
})

// ... existing actions ...

/**
 * Student requests to join a competition
 */
export async function requestToJoinCompetition(competitionId: string) {
    try {
        const { supabase, user } = await requireUser();

        // Check if entries are locked
        const { data: competition } = await supabase
            .from('competitions')
            .select('is_entry_locked')
            .eq('id', competitionId)
            .single();
        
        if (competition?.is_entry_locked) {
            throw new Error('Entries are locked for this competition');
        }

        // Check if already a participant
        const { data: existing } = await supabase
            .from('competition_participants')
            .select('status')
            .eq('competition_id', competitionId)
            .eq('user_id', user.id)
            .single();

        if (existing) {
            return { success: true, alreadyJoined: true };
        }

        // Insert as PENDING participant
        const { error } = await supabase
            .from('competition_participants')
            .insert({
                competition_id: competitionId,
                user_id: user.id,
                status: 'PENDING'
            });

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Error requesting to join:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Teacher approves a participant
 */
export async function approveParticipant(competitionId: string, userId: string) {
    try {
        const { supabase } = await requireTeacher();
        const { error } = await supabase
            .from('competition_participants')
            .update({ status: 'ACCEPTED' })
            .eq('competition_id', competitionId)
            .eq('user_id', userId);

        if (error) throw error;
        revalidatePath(`/competitions/${competitionId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Teacher rejects/removes a participant
 */
export async function rejectParticipant(competitionId: string, userId: string) {
    try {
        const { supabase } = await requireTeacher();
        const { error } = await supabase
            .from('competition_participants')
            .delete()
            .eq('competition_id', competitionId)
            .eq('user_id', userId);

        if (error) throw error;
        revalidatePath(`/competitions/${competitionId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Teacher bans a participant
 */
export async function banParticipant(competitionId: string, userId: string) {
    try {
        const { supabase } = await requireTeacher();
        const { error } = await supabase
            .from('competition_participants')
            .update({ status: 'BANNED' })
            .eq('competition_id', competitionId)
            .eq('user_id', userId);

        if (error) throw error;
        revalidatePath(`/competitions/${competitionId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Teacher locks entries
 */
export async function lockCompetitionEntries(competitionId: string) {
    try {
        const { supabase } = await requireTeacher();
        const { error } = await supabase
            .from('competitions')
            .update({ is_entry_locked: true })
            .eq('id', competitionId);

        if (error) throw error;
        revalidatePath(`/competitions/${competitionId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Teacher starts the quiz session (randomizes problems and starts timer)
 */
export async function startQuizSession(competitionId: string) {
    try {
        const { supabase } = await requireTeacher();
        
        // Fetch random questions (2-2-1)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        const response = await fetch(`${API_URL}/judge/random?type=quiz`, {
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch random problems: ${response.statusText}`);
        }

        const problems = await response.json();
        
        if (!Array.isArray(problems) || problems.length === 0) {
            throw new Error('No problems were returned from the problem bank');
        }
        
        const problemIds = problems.map((p: any) => p.id || p._id);

        const { error } = await supabase
            .from('competitions')
            .update({
                status: 'ACTIVE',
                is_active: true,
                started_at: new Date().toISOString(),
                selected_problems: problemIds,
                quiz_started: true
            })
            .eq('id', competitionId);

        if (error) throw error;
        revalidatePath(`/competitions/${competitionId}`);
        return { success: true };
    } catch (error: any) {
        console.error('startQuizSession Error:', error);
        return { success: false, error: error.message || 'Failed to start session' };
    }
}

// --- Actions ---

/**
 * Get all problems available for competition selection
 */
export async function getAvailableProblems() {
    try {
        const { supabase } = await requireTeacher()

        const { data: problems, error } = await supabase
            .from('problems')
            .select('id, title, slug, difficulty, category, points')
            .order('difficulty', { ascending: true })
            .order('title', { ascending: true })

        if (error) throw error

        return { success: true, problems: problems || [] }
    } catch (error: any) {
        console.error('Error fetching problems:', error)
        return { success: false, error: error.message, problems: [] }
    }
}

/**
 * Create a new competition for a classroom
 */
export async function createCompetition(data: z.infer<typeof CreateCompetitionSchema>) {
    try {
        const { supabase, user } = await requireTeacher()

        // Validate input
        const validated = CreateCompetitionSchema.parse(data)

        // Verify teacher owns the classroom
        const { data: classroom, error: classError } = await supabase
            .from('classrooms')
            .select('id')
            .eq('id', validated.classroomId)
            .eq('teacher_id', user.id)
            .single()

        if (classError || !classroom) {
            throw new Error('Classroom not found or unauthorized')
        }

        // Generate invite code
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

        // Create competition
        const { data: competition, error: compError } = await supabase
            .from('competitions')
            .insert({
                title: validated.title,
                description: validated.description,
                classroom_id: validated.classroomId,
                creator_id: user.id,
                invite_code: inviteCode,
                selected_problems: validated.selectedProblems || [],
                duration_minutes: validated.durationMinutes,
                max_participants: validated.maxParticipants,
                penalty_per_wrong: 10,
                max_rank_display: 3,
                status: 'DRAFT',
                is_active: false,
                is_quiz_mode: validated.isQuizMode,
                is_battle_test: validated.isBattleTest
            })
            .select()
            .single()

        if (compError) throw compError

        // Auto-register all classroom students
        const { data: students } = await supabase
            .from('classroom_students')
            .select('student_id')
            .eq('classroom_id', validated.classroomId)

        if (students && students.length > 0) {
            const participants = students.map(s => ({
                competition_id: competition.id,
                user_id: s.student_id
            }))

            await supabase
                .from('competition_participants')
                .insert(participants)
        }

        revalidatePath(`/classes/${validated.classroomId}`)
        return { success: true, competition }

    } catch (error: any) {
        console.error('Error creating competition:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Start a competition (make it active)
 */
export async function startCompetition(competitionId: string) {
    try {
        const { supabase, user } = await requireTeacher()

        // Verify ownership
        const { data: competition, error: fetchError } = await supabase
            .from('competitions')
            .select('id, classroom_id, classrooms!inner(teacher_id)')
            .eq('id', competitionId)
            .single()

        if (fetchError || !competition) {
            throw new Error('Competition not found')
        }

        if ((competition as any).classrooms.teacher_id !== user.id) {
            throw new Error('Unauthorized')
        }

        // Start competition
        const { error: updateError } = await supabase
            .from('competitions')
            .update({
                status: 'ACTIVE',
                is_active: true,
                started_at: new Date().toISOString()
            })
            .eq('id', competitionId)

        if (updateError) throw updateError

        revalidatePath(`/competitions/${competitionId}`)
        return { success: true }

    } catch (error: any) {
        console.error('Error starting competition:', error)
        return { success: false, error: error.message }
    }
}

/**
 * End a competition
 */
export async function endCompetition(competitionId: string) {
    try {
        const { supabase, user } = await requireTeacher()

        // Verify ownership
        const { data: competition, error: fetchError } = await supabase
            .from('competitions')
            .select('id, classroom_id, classrooms!inner(teacher_id)')
            .eq('id', competitionId)
            .single()

        if (fetchError || !competition) {
            throw new Error('Competition not found')
        }

        if ((competition as any).classrooms.teacher_id !== user.id) {
            throw new Error('Unauthorized')
        }

        // End competition
        const { error: updateError } = await supabase
            .from('competitions')
            .update({
                status: 'COMPLETED',
                is_active: false,
                ended_at: new Date().toISOString()
            })
            .eq('id', competitionId)

        if (updateError) throw updateError

        revalidatePath(`/competitions/${competitionId}`)
        return { success: true }

    } catch (error: any) {
        console.error('Error ending competition:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get competition details with leaderboard
 */
export async function getCompetitionDetails(competitionId: string) {
    try {
        const { supabase } = await requireTeacher()

        // Get competition
        const { data: competition, error: compError } = await supabase
            .from('competitions')
            .select(`
                *,
                classrooms(id, name, teacher_id),
                problems:selected_problems
            `)
            .eq('id', competitionId)
            .single()

        if (compError) throw compError

        // Get leaderboard
        const { data: leaderboard, error: leaderError } = await supabase
            .from('competition_leaderboard')
            .select('*')
            .eq('competition_id', competitionId)
            .order('rank_position', { ascending: true })
            .limit(100)

        if (leaderError) throw leaderError

        // Get problem details
        const { data: problems, error: probError } = await supabase
            .from('problems')
            .select('id, title, difficulty, points')
            .in('id', competition.selected_problems || [])

        if (probError) throw probError

        return {
            success: true,
            competition,
            leaderboard: leaderboard || [],
            problems: problems || []
        }

    } catch (error: any) {
        console.error('Error fetching competition details:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get classroom competitions
 */
export async function getClassroomCompetitions(classroomId: string) {
    try {
        const { supabase } = await requireTeacher()

        const { data: competitions, error } = await supabase
            .from('competitions')
            .select(`
                *,
                participants:competition_participants(count)
            `)
            .eq('classroom_id', classroomId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return {
            success: true,
            competitions: competitions || []
        }

    } catch (error: any) {
        console.error('Error fetching classroom competitions:', error)
        return { success: false, error: error.message, competitions: [] }
    }
}

/**
 * Get teacher's game rooms (alias for competitions)
 * For backward compatibility with existing code
 */
export async function getTeacherGameRooms() {
    try {
        const { supabase, user } = await requireTeacher()
        
        console.log('Fetching rooms for teacher:', user.id)

        const { data: competitions, error } = await supabase
            .from('competitions')
            .select(`
                *
            `)
            .eq('creator_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase error fetching rooms:', error)
            throw error
        }

        const { data: allParticipants } = await supabase
            .from('competition_participants')
            .select('competition_id, status')
            .in('competition_id', (competitions || []).map(c => c.id))

        const formattedRooms = (competitions || []).map(room => {
            const roomParticipants = allParticipants?.filter(p => p.competition_id === room.id) || []
            return {
                ...room,
                participants_count: roomParticipants.filter(p => p.status === 'ACCEPTED' || !p.status).length,
                pending_requests: roomParticipants.filter(p => p.status === 'PENDING').length
            }
        })

        return {
            success: true,
            rooms: formattedRooms
        }

    } catch (error: any) {
        console.error('Error fetching game rooms:', error)
        return { success: false, error: error.message, rooms: [] }
    }
}

/**
 * Get teacher's active battles/competitions
 * For backward compatibility with existing code
 */
export async function getTeacherBattles() {
    try {
        const { supabase, user } = await requireTeacher()

        const { data: battles, error } = await supabase
            .from('competitions')
            .select(`
                *,
                participants:competition_participants(count)
            `)
            .eq('creator_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) throw error

        return {
            success: true,
            battles: battles || []
        }

    } catch (error: any) {
        console.error('Error fetching battles:', error)
        return { success: false, error: error.message, battles: [] }
    }
}

export async function createGameRoom(data: {
    title: string;
    description?: string;
    difficulty: string;
    maxParticipants: number;
    durationMinutes: number;
    selectedProblems: string[];
    isQuizMode?: boolean;
    isBattleTest?: boolean;
}) {
    try {
        const { supabase, user } = await requireTeacher()

        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

        const { data: competition, error } = await supabase
            .from('competitions')
            .insert({
                title: data.title,
                description: data.description || null,
                difficulty: data.difficulty,
                creator_id: user.id,
                invite_code: inviteCode,
                selected_problems: data.selectedProblems,
                duration_minutes: data.durationMinutes,
                max_participants: data.maxParticipants,
                penalty_per_wrong: 10,
                max_rank_display: 3,
                status: 'DRAFT',
                is_active: false,
                is_quiz_mode: data.isQuizMode || false,
                is_battle_test: data.isBattleTest || false
            })
            .select()
            .single()

        if (error) throw error

        revalidatePath('/teacher/competitions')
        return { success: true, room: competition }

    } catch (error: any) {
        console.error('Error creating game room:', error)
        return { success: false, error: error.message }
    }
}
