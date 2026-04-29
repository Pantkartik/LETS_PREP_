'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

export interface UserProfile {
    id: string;
    email: string;
    username: string;
    full_name: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    avatar_url?: string;
    xp: number;
    level: number;
    total_battles: number;
    total_wins: number;
    rank_position?: number;
    bio?: string;
    website?: string;
    github_username?: string;
    twitter_username?: string;
    linkedin_username?: string;
    last_name_change_at?: string;
    teacher_stats?: {
        students_participated: number;
        rating: number;
        rating_count: number;
        contests_held: number;
        battles_held: number;
    };
    judge_stats?: {
        Easy: number;
        Medium: number;
        Hard: number;
        total: number;
    };
    latest_submissions?: any[];
}

export function useUserProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshProfile = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const supabase = createClient();
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    setError('Failed to get session');
                    setLoading(false);
                    return;
                }

                if (!session) {
                    console.log('No active session');
                    setLoading(false);
                    return;
                }

                console.log('Fetching profile for user:', session.user.id);

                let { data, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) {
                    // Check if profile doesn't exist (PGRST116)
                    if (profileError.code === 'PGRST116') {
                        console.log('Profile not found, creating default profile...');

                        // Smart name generation
                        const emailPrefix = session.user.email?.split('@')[0] || 'User';
                        const properName = session.user.user_metadata?.full_name ||
                            session.user.user_metadata?.name ||
                            (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1));

                        const defaultProfile = {
                            id: session.user.id,
                            email: session.user.email || '',
                            username: session.user.user_metadata?.username || emailPrefix,
                            full_name: properName,
                            role: 'STUDENT' as const,
                            xp: 0,
                            level: 1,
                            total_battles: 0,
                            total_wins: 0,
                        };

                        console.log('Attempting to insert profile:', defaultProfile);

                        const { data: insertedProfile, error: insertError } = await supabase
                            .from('profiles')
                            .insert([defaultProfile])
                            .select()
                            .single();

                        if (insertError) {
                            // Handle race condition: Profile created by another request in the meantime
                            if (insertError.code === '23505') { // unique_violation
                                console.log('Profile already exists (race condition), fetching existing...');
                                const { data: existingData, error: retryError } = await supabase
                                    .from('profiles')
                                    .select('*')
                                    .eq('id', session.user.id)
                                    .single();

                                if (retryError) {
                                    throw retryError;
                                }
                                data = existingData;
                            } else {
                                console.error('Failed to create profile - Full error:', {
                                    message: insertError.message,
                                    details: insertError.details,
                                    hint: insertError.hint,
                                    code: insertError.code,
                                });
                                setError(`Failed to create profile: ${insertError.message || 'Unknown error'}`);
                                setLoading(false);
                                return;
                            }
                        } else {
                            console.log('Profile created successfully:', insertedProfile);
                            data = insertedProfile;
                        }
                    } else {
                        console.error('Profile fetch error details:', {
                            message: profileError.message,
                            details: profileError.details,
                            hint: profileError.hint,
                            code: profileError.code,
                        });
                        setError(profileError.message || 'Failed to fetch profile');
                        setLoading(false);
                        return;
                    }
                }

                // If we have data (either freshly fetched, created, or recovered from race condition)
                if (data) {
                    // BACKFILL: Check if profile exists but has null name/username
                    if (!data.full_name || !data.username) {
                        console.log('Profile found but missing name/username. Backfilling...');

                        const emailPrefix = session.user.email?.split('@')[0] || 'User';
                        const properName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

                        const updates: any = {};
                        if (!data.full_name) updates.full_name = session.user.user_metadata?.full_name || properName;
                        if (!data.username) updates.username = session.user.user_metadata?.username || emailPrefix;

                        if (Object.keys(updates).length > 0) {
                            const { data: updatedProfile, error: updateError } = await supabase
                                .from('profiles')
                                .update(updates)
                                .eq('id', session.user.id)
                                .select()
                                .single();

                            if (!updateError && updatedProfile) {
                                console.log('Backfilled profile data:', updatedProfile);
                                data.full_name = updatedProfile.full_name;
                                data.username = updatedProfile.username;
                            }
                        }
                    }

                    // Set profile as soon as we have basic data
                    setProfile(data);
                    setLoading(false);

                    // Fetch secondary data in background (non-blocking)
                    (async () => {
                        const backgroundUpdates: Partial<UserProfile> = {};
                        let hasUpdates = false;

                        // Fetch Teacher Stats if applicable
                        if (data.role === 'TEACHER') {
                            try {
                                const { data: teacherStats, error: statsError } = await supabase
                                    .rpc('get_teacher_stats', { t_id: session.user.id });

                                if (!statsError && teacherStats) {
                                    backgroundUpdates.teacher_stats = teacherStats;
                                    hasUpdates = true;
                                }
                            } catch (statsErr) {
                                console.warn('Failed to fetch teacher stats:', statsErr);
                            }
                        }

                        // Get rank and judge data if student
                        if (data.role === 'STUDENT') {
                            try {
                                // 1. Leaderboard rank
                                const { data: leaderboardData } = await supabase
                                    .from('global_leaderboard')
                                    .select('rank_position')
                                    .eq('id', session.user.id)
                                    .single();

                                if (leaderboardData) {
                                    backgroundUpdates.rank_position = leaderboardData.rank_position;
                                    hasUpdates = true;
                                }

                                // 2. Judge Stats and Submissions (with timeout)
                                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
                                
                                const fetchWithTimeout = async (url: string, timeout = 3000) => {
                                    const controller = new AbortController();
                                    const id = setTimeout(() => controller.abort(), timeout);
                                    const response = await fetch(url, { signal: controller.signal });
                                    clearTimeout(id);
                                    return response;
                                };

                                const [statsRes, submissionsRes] = await Promise.allSettled([
                                    fetchWithTimeout(`${API_BASE_URL}/judge/stats/${session.user.id}`),
                                    fetchWithTimeout(`${API_BASE_URL}/judge/submissions/${session.user.id}`)
                                ]);

                                if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
                                    backgroundUpdates.judge_stats = await statsRes.value.json();
                                    hasUpdates = true;
                                }
                                if (submissionsRes.status === 'fulfilled' && submissionsRes.value.ok) {
                                    backgroundUpdates.latest_submissions = await submissionsRes.value.json();
                                    hasUpdates = true;
                                }
                            } catch (err) {
                                console.warn('Background data fetch failed:', err);
                            }
                        }

                        if (hasUpdates) {
                            setProfile(prev => prev ? { ...prev, ...backgroundUpdates } : null);
                        }
                    })();
                }
            } catch (err: any) {
                const errorMessage = err?.message || 'Unknown error occurred';
                setError(errorMessage);
                console.error('Error fetching profile - Caught exception:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [refreshTrigger]);

    return { profile, loading, error, refreshProfile };
}
