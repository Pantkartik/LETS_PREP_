import { supabase } from '../config/supabase';
import logger from '../config/logger';

export class ProblemService {
  public async getAll(filters: { difficulty?: string; category?: string; page?: number; limit?: number }) {
    const { difficulty, category, page = 1, limit = 20 } = filters;
    
    let query = supabase
      .from('problems')
      .select('*', { count: 'exact' })
      .eq('approved', true);

    if (difficulty) query = query.eq('difficulty', difficulty);
    if (category) query = query.eq('category', category);

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) {
      logger.error('Error fetching problems', error);
      throw error;
    }

    return {
      problems: data,
      count,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  public async getById(id: string) {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  public async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }

  public async create(problemData: any) {
    const { data, error } = await supabase
      .from('problems')
      .insert(problemData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async update(id: string, updateData: any) {
    const { data, error } = await supabase
      .from('problems')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async delete(id: string) {
    const { error } = await supabase
      .from('problems')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

export const problemService = new ProblemService();
export default problemService;
