import { Request, Response, NextFunction } from 'express';
import problemService from '../services/problem.service';
import { AuthRequest } from '../middleware/auth';
import logger from '../config/logger';

export class ProblemController {
  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { difficulty, category, page, limit } = req.query;
      const result = await problemService.getAll({
        difficulty: difficulty as string,
        category: category as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (err) {
      next(err);
    }
  };

  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await problemService.getById(req.params.id);
      if (!problem) {
        return res.status(404).json({ status: 'fail', message: 'Problem not found' });
      }
      res.status(200).json({ status: 'success', data: { problem } });
    } catch (err) {
      next(err);
    }
  };

  public getBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await problemService.getBySlug(req.params.slug);
      if (!problem) {
        return res.status(404).json({ status: 'fail', message: 'Problem not found' });
      }
      res.status(200).json({ status: 'success', data: { problem } });
    } catch (err) {
      next(err);
    }
  };

  public create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const problemData = { ...req.body, created_by: req.user?.id };
      const problem = await problemService.create(problemData);
      res.status(201).json({ status: 'success', data: { problem } });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await problemService.update(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: { problem } });
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await problemService.delete(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) {
      next(err);
    }
  };
}

export const problemController = new ProblemController();
export default problemController;
