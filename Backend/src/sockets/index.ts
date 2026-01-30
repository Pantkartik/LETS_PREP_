import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../config/logger';
import { supabase } from '../config/supabase';
import { RedisService } from '../services/redis.service';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    username?: string;
    battleId?: string;
}

export const initializeSocketIO = (io: SocketIOServer): void => {
    const redis = RedisService.getInstance();

    // Authentication middleware
    io.use(async (socket: AuthenticatedSocket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication token required'));
            }

            // Verify token with Supabase
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                return next(new Error('Invalid authentication token'));
            }

            // Get user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, username')
                .eq('id', user.id)
                .single();

            if (!profile) {
                return next(new Error('User profile not found'));
            }

            socket.userId = profile.id;
            socket.username = profile.username;

            next();
        } catch (error) {
            logger.error('Socket authentication error', { error });
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
        logger.info('Client connected', {
            socketId: socket.id,
            userId: socket.userId,
            username: socket.username
        });

        // Join user's personal room
        socket.join(`user:${socket.userId}`);

        // ==================== BATTLE EVENTS ====================

        // Join battle room
        socket.on('battle:join', async (data: { battleId: string }) => {
            try {
                const { battleId } = data;

                // Verify user is participant
                const { data: participant } = await supabase
                    .from('battle_participants')
                    .select('*')
                    .eq('battle_id', battleId)
                    .eq('user_id', socket.userId)
                    .single();

                if (!participant) {
                    socket.emit('error', { message: 'Not a participant of this battle' });
                    return;
                }

                // Join battle room
                socket.join(`battle:${battleId}`);
                socket.battleId = battleId;

                // Add user to Redis battle set
                await redis.addUserToBattle(battleId, socket.userId!);

                // Get current battle users
                const battleUsers = await redis.getBattleUsers(battleId);

                // Notify all users in battle
                io.to(`battle:${battleId}`).emit('battle:user_joined', {
                    userId: socket.userId,
                    username: socket.username,
                    totalUsers: battleUsers.length,
                });

                // Send current battle state to user
                const battleState = await redis.getBattleState(battleId);
                socket.emit('battle:state', battleState);

                logger.info('User joined battle', { userId: socket.userId, battleId });
            } catch (error) {
                logger.error('Error joining battle', { error });
                socket.emit('error', { message: 'Failed to join battle' });
            }
        });

        // Leave battle room
        socket.on('battle:leave', async (data: { battleId: string }) => {
            try {
                const { battleId } = data;

                socket.leave(`battle:${battleId}`);
                await redis.removeUserFromBattle(battleId, socket.userId!);

                const battleUsers = await redis.getBattleUsers(battleId);

                io.to(`battle:${battleId}`).emit('battle:user_left', {
                    userId: socket.userId,
                    username: socket.username,
                    totalUsers: battleUsers.length,
                });

                logger.info('User left battle', { userId: socket.userId, battleId });
            } catch (error) {
                logger.error('Error leaving battle', { error });
            }
        });

        // Battle ready status
        socket.on('battle:ready', async (data: { battleId: string }) => {
            try {
                const { battleId } = data;

                // Update participant status
                await supabase
                    .from('battle_participants')
                    .update({ status: 'READY' })
                    .eq('battle_id', battleId)
                    .eq('user_id', socket.userId);

                io.to(`battle:${battleId}`).emit('battle:user_ready', {
                    userId: socket.userId,
                    username: socket.username,
                });

                logger.info('User ready for battle', { userId: socket.userId, battleId });
            } catch (error) {
                logger.error('Error setting battle ready', { error });
            }
        });

        // Start coding (typing indicator)
        socket.on('battle:start_coding', async (data: { battleId: string }) => {
            try {
                const { battleId } = data;

                await supabase
                    .from('battle_participants')
                    .update({
                        status: 'ACTIVE',
                        started_coding_at: new Date().toISOString(),
                    })
                    .eq('battle_id', battleId)
                    .eq('user_id', socket.userId);

                io.to(`battle:${battleId}`).emit('battle:user_coding', {
                    userId: socket.userId,
                    username: socket.username,
                });
            } catch (error) {
                logger.error('Error starting coding', { error });
            }
        });

        // Typing indicator
        socket.on('battle:typing', (data: { battleId: string; isTyping: boolean }) => {
            const { battleId, isTyping } = data;

            socket.to(`battle:${battleId}`).emit('battle:user_typing', {
                userId: socket.userId,
                username: socket.username,
                isTyping,
            });
        });

        // Code submission
        socket.on('battle:submit', async (data: { battleId: string; submissionId: string }) => {
            try {
                const { battleId, submissionId } = data;

                io.to(`battle:${battleId}`).emit('battle:user_submitted', {
                    userId: socket.userId,
                    username: socket.username,
                    submissionId,
                    timestamp: new Date().toISOString(),
                });

                logger.info('User submitted code', { userId: socket.userId, battleId, submissionId });
            } catch (error) {
                logger.error('Error on code submission', { error });
            }
        });

        // Update leaderboard
        socket.on('battle:update_leaderboard', async (data: { battleId: string; score: number }) => {
            try {
                const { battleId, score } = data;

                await redis.addToLeaderboard(battleId, socket.userId!, score);

                const leaderboard = await redis.getLeaderboard(battleId, 10);

                io.to(`battle:${battleId}`).emit('battle:leaderboard_updated', {
                    leaderboard,
                });
            } catch (error) {
                logger.error('Error updating leaderboard', { error });
            }
        });

        // ==================== CHAT EVENTS ====================

        socket.on('chat:message', async (data: { battleId: string; message: string }) => {
            try {
                const { battleId, message } = data;

                // Save message to database
                const { data: chatMessage, error } = await supabase
                    .from('chat_messages')
                    .insert({
                        battle_id: battleId,
                        user_id: socket.userId,
                        message,
                        message_type: 'TEXT',
                    })
                    .select('*, profiles(username, avatar_url)')
                    .single();

                if (error) throw error;

                // Broadcast to battle room
                io.to(`battle:${battleId}`).emit('chat:new_message', chatMessage);

                logger.info('Chat message sent', { userId: socket.userId, battleId });
            } catch (error) {
                logger.error('Error sending chat message', { error });
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('chat:typing', (data: { battleId: string; isTyping: boolean }) => {
            const { battleId, isTyping } = data;

            socket.to(`battle:${battleId}`).emit('chat:user_typing', {
                userId: socket.userId,
                username: socket.username,
                isTyping,
            });
        });

        // ==================== NOTIFICATION EVENTS ====================

        socket.on('notification:read', async (data: { notificationId: string }) => {
            try {
                const { notificationId } = data;

                await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('id', notificationId)
                    .eq('user_id', socket.userId);

                socket.emit('notification:updated', { notificationId, isRead: true });
            } catch (error) {
                logger.error('Error marking notification as read', { error });
            }
        });

        // ==================== DISCONNECT ====================

        socket.on('disconnect', async () => {
            logger.info('Client disconnected', {
                socketId: socket.id,
                userId: socket.userId
            });

            // Clean up battle participation
            if (socket.battleId) {
                await redis.removeUserFromBattle(socket.battleId, socket.userId!);

                const battleUsers = await redis.getBattleUsers(socket.battleId);

                io.to(`battle:${socket.battleId}`).emit('battle:user_left', {
                    userId: socket.userId,
                    username: socket.username,
                    totalUsers: battleUsers.length,
                });
            }
        });

        // Error handling
        socket.on('error', (error) => {
            logger.error('Socket error', { error, socketId: socket.id });
        });
    });

    logger.info('Socket.IO event handlers initialized');
};

// Helper function to emit to specific user
export const emitToUser = (io: SocketIOServer, userId: string, event: string, data: any): void => {
    io.to(`user:${userId}`).emit(event, data);
};

// Helper function to emit to battle
export const emitToBattle = (io: SocketIOServer, battleId: string, event: string, data: any): void => {
    io.to(`battle:${battleId}`).emit(event, data);
};
