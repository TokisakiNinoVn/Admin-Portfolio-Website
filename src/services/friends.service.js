// src/services/categories-skills.service.js

import supabase from '@/apis/supabase';

class FriendsService {
  async list() {
    const { data, error } = await supabase.from('friends').select('*');

    if (error) {
      throw error;
    }

    return data;
  }

  async create(payload) {
    const { data, error } = await supabase
      .from('friends')
      .insert(payload)
      // .select();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(id, payload) {
    const { data, error } = await supabase
      .from('friends')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return data;
  }

  async delete(id) {
    const { data, error } = await supabase.from('friends').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return data;
  }

  // Get list skill by category id
  async listSkillByCategory(categoryId) {
    const { data, error } = await supabase
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

export default new FriendsService();
