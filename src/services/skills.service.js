// src/services/skill.service.js

import supabase from '@/apis/supabase';

class SkillsService {
  async list() {
    const { data, error } = await supabase.from('skills').select('*');

    if (error) {
      throw error;
    }

    return data;
  }

  async create(payload) {
    const { data, error } = await supabase
      .from('skills')
      .insert(payload)
      // .select();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(id, payload) {
    const { data, error } = await supabase
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
    const { data, error } = await supabase.from('skills').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return data;
  }

  async listSkillByCategory(categoryId) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('categories_skill_id', categoryId);

    if (error) {
      throw error;
    }

    return data;
  }
}

export default new SkillsService();
