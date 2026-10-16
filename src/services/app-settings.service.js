// src/services/app-settings.service.js

import supabase from '@/apis/supabase';

class AppSettingsService {
  async list() {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async create(payload) {
    const dataToInsert = {
      name_app: payload.name_app?.trim() || null,
      link_app: payload.link_app?.trim() || null,
      is_active: typeof payload.is_active === 'boolean' ? payload.is_active : true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('app_settings')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(id, payload) {
    const dataToUpdate = {
      ...payload,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('app_settings')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('app_settings')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return data;
  }

  async toggleActive(id, newStatus) {
    let nextStatus = newStatus;
    if (typeof nextStatus !== 'boolean') {
      const { data: current, error: fetchError } = await supabase
        .from('app_settings')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      nextStatus = !current?.is_active;
    }

    const { data, error } = await supabase
      .from('app_settings')
      .update({
        is_active: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async changeIsActive(id) {
    return this.toggleActive(id);
  }
}

export default new AppSettingsService();

