import { supabase } from '../config/supabase';
import redisService from './redis.service';
import logger from '../config/logger';

export class BattleService {
  public async create(userId: string, battleData: any) {
    const roomCode = this.generateRoomCode();
    
    const { data: battle, error } = await supabase
      .from('battles')
      .insert({
        ...battleData,
        room_code: roomCode,
        created_by: userId,
        status: 'WAITING'
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-join creator
    await this.join(battle.id, userId);

    return battle;
  }

  public async join(battleId: string, userId: string) {
    // Check if battle exists and is not full
    const { data: battle } = await supabase
      .from('battles')
      .select('*, participants:battle_participants(count)')
      .eq('id', battleId)
      .single();

    if (!battle) throw new Error('Battle not found');
    
    const { data: participant, error } = await supabase
      .from('battle_participants')
      .upsert({
        battle_id: battleId,
        user_id: userId,
        status: 'JOINED'
      })
      .select()
      .single();

    if (error) throw error;

    // Cache participant in Redis for real-time presence
    await redisService.updateLeaderboard(battleId, userId, 0);
    
    return participant;
  }

  public async start(battleId: string, userId: string) {
    const { data: battle } = await supabase.from('battles').select('created_by').eq('id', battleId).single();
    if (battle?.created_by !== userId) throw new Error('Only creator can start');

    const { data, error } = await supabase
      .from('battles')
      .update({ status: 'ACTIVE', actual_start_time: new Date().toISOString() })
      .eq('id', battleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  public async getBattleState(battleId: string) {
    // Combine Supabase data with Redis real-time data
    const { data: battle } = await supabase
      .from('battles')
      .select('*, participants:battle_participants(*, user:profiles(*))')
      .eq('id', battleId)
      .single();

    const realTimeLeaderboard = await redisService.getLeaderboard(battleId);
    
    return {
      ...battle,
      realTimeLeaderboard
    };
  }
}

export const battleService = new BattleService();
export default battleService;
