import { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '../config/logger';
import { supabase } from '../config/supabase';
import redisService from '../services/redis.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const initializeSocketIO = (io: SocketIOServer): void => {
  // Authentication middleware for Sockets
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication token required'));

      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return next(new Error('Invalid token'));

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', user.id)
        .single();

      if (!profile) return next(new Error('Profile not found'));

      socket.userId = profile.id;
      socket.username = profile.username;
      next();
    } catch (err) {
      logger.error('Socket Auth Error', err);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Client connected: ${socket.username} (${socket.id})`);

    // Join personal room for private notifications
    socket.join(`user:${socket.userId}`);

    // --- Battle Events ---
    socket.on('battle:join', async ({ battleId }) => {
      socket.join(`battle:${battleId}`);
      await redisService.updateLeaderboard(battleId, socket.userId!, 0);
      
      io.to(`battle:${battleId}`).emit('battle:user_joined', {
        userId: socket.userId,
        username: socket.username
      });
      logger.info(`User ${socket.username} joined battle ${battleId}`);
    });

    socket.on('battle:typing', ({ battleId, isTyping }) => {
      socket.to(`battle:${battleId}`).emit('battle:user_typing', {
        userId: socket.userId,
        isTyping
      });
    });

    socket.on('chat:message', async ({ battleId, message }) => {
      try {
        const { data: chatMsg, error } = await supabase
          .from('chat_messages')
          .insert({
            battle_id: battleId,
            user_id: socket.userId,
            message
          })
          .select('*, profiles(username, avatar_url)')
          .single();

        if (error) throw error;
        io.to(`battle:${battleId}`).emit('chat:new_message', chatMsg);
      } catch (err) {
        logger.error('Chat Error', err);
      }
    });

    // --- Disconnect ---
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.username}`);
    });
  });

  logger.info('Socket.IO initialized');
};
