// src/services/curriculum-vitae.service.js

import { getSupabase } from '@/lib/supabase';

class CurriculumVitaeService {
  async list() {
    const { data, error } = await getSupabase().from('curriculum_vitae').select('*');

    if (error) {
      throw error;
    }

    return data;
  }

  // detail by id
  async get(id) {
    const { data, error } = await getSupabase()
      .from('curriculum_vitae')
      .select('*')
      .eq('id', id);

    if (error) {
      throw error;
    }

    return data;
  }

  async create(payload) {
    const { data, error } = await getSupabase()
      .from('curriculum_vitae')
      .insert(payload)
      // .select();

    if (error) {
      throw error;
    }

    return data;
  }

  async createBaseCv(payload) {
    const { data, error } = await getSupabase()
      .from('cvs')
      .insert(payload)
      // .select();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(id, payload) {
    const { data, error } = await getSupabase()
      .from('curriculum_vitae')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return data;
  }

  async delete(id, bucket, path) {
    const { error: dbError } = await getSupabase()
      .from('curriculum_vitae')
      .delete()
      .eq('id', id);

    if (dbError) {
      throw dbError;
    }

    if (bucket && path) {
      const filePath = path.split('/').pop();

      const { error: storageError } = await getSupabase().storage
        .from(bucket)
        .remove([filePath]);

      if (storageError) {
        throw storageError;
      }
    }

    return true;
  }
}
const curriculumVitaeService = new CurriculumVitaeService();

export default curriculumVitaeService;
