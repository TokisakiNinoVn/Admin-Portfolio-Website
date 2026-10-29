// src/services/categories-skills.service.js

import { getSupabase } from '@/lib/supabase';

class SkillCategoriesService {
  async list() {
    const { data, error } = await getSupabase().from('skill_categories').select('*');

    if (error) {
      throw error;
    }

    return data;
  }

  async create(payload) {
    const { data, error } = await getSupabase()
      .from('skill_categories')
      .insert(payload)
      // .select();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(id, payload) {
    const { data, error } = await getSupabase()
      .from('skill_categories')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return data;
  }

  async delete(id) {
    const { data, error } = await getSupabase().from('skill_categories').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return data;
  }

  // Get list skill by category id
  async listSkillByCategory(categoryId) {
    const { data, error } = await getSupabase()
      .from('skills')
      .select('*')
      .eq('skill_category_id', categoryId)
      .order('label', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }
}

const skillCategoriesService = new SkillCategoriesService();

export default skillCategoriesService;
