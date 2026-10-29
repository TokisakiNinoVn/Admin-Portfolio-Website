// src/services/friends.service.js

import { getSupabase } from '@/lib/supabase';

class FriendsService {
  async list() {
    const { data, error } = await getSupabase().from('friends').select('*');

    if (error) {
      throw error;
    }

    return data;
  }

  async create(payload) {
    const { data, error } = await getSupabase()
      .from('friends')
      .insert(payload)
      // .select();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(id, payload) {
    const { data, error } = await getSupabase()
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
    const { data, error } = await getSupabase().from('friends').delete().eq('id', id);

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

const friendsService = new FriendsService();

export default friendsService;
