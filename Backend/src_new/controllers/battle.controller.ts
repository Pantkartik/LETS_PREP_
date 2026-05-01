import { Request, Response, NextFunction } from 'express';
import battleService from '../services/battle.service';
import { AuthRequest } from '../middleware/auth';
import { supabase } from '../config/supabase';

export class BattleController {
  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, difficulty, page = 1, limit = 20 } = req.query;
      
      let query = supabase
        .from('battles')
        .select('*, created_by:profiles(username, avatar_url)', { count: 'exact' });

      if (status) query = query.eq('status', status);
      if (difficulty) query = query.eq('difficulty', difficulty);

      const from = (Number(page) - 1) * Number(limit);
      query = query.range(from, from + Number(limit) - 1).order('created_at', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;

      res.status(200).json({
        status: 'success',
        data: {
          battles: data,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit)
          }
        }
      });
    } catch (err) {
      next(err);
    }
  };

  public create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const battle = await battleService.create(req.user!.id, req.body);
      res.status(201).json({ status: 'success', data: { battle } });
    } catch (err) {
      next(err);
    }
  };

  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const battle = await battleService.getBattleState(req.params.id);
      res.status(200).json({ status: 'success', data: { battle } });
    } catch (err) {
      next(err);
    }
  };

  public join = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const participant = await battleService.join(req.params.id, req.user!.id);
      res.status(200).json({ status: 'success', data: { participant } });
    } catch (err) {
      next(err);
    }
  };

  public start = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const battle = await battleService.start(req.params.id, req.user!.id);
      res.status(200).json({ status: 'success', data: { battle } });
    } catch (err) {
      next(err);
    }
  };
}

export const battleController = new BattleController();
export default battleController;
