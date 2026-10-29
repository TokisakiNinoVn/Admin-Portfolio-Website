// src/services/skills.service.js

import { getSupabase } from '@/lib/supabase';

class SkillsService {
  async list() {
    const { data, error } = await getSupabase().from('skills').select('*');

    if (error) {
      throw error;
    }

    return data;
  }

  async create(payload) {
    const { data, error } = await getSupabase()
      .from('skills')
      .insert(payload)
      // .select();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(id, payload) {
    const { data, error } = await getSupabase()
      .from('skills')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return data;
  }

  async delete(id) {
    const { data, error } = await getSupabase().from('skills').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return data;
  }

  async listSkillByCategory(categoryId) {
    const { data, error } = await getSupabase()
      .from('skills')
      .select('*')
      .eq('categories_skill_id', categoryId);

    if (error) {
      throw error;
    }

    return data;
  }
}

const skillsService = new SkillsService();

export default skillsService;
