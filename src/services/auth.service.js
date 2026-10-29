// src/services/auth.service.js

import { getSupabase } from '@/lib/supabase';

class AuthService {
  async signInWithPassword(email, password) {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const userId = data.user.id;

    const { data: userRole, error: userRoleError } = await getSupabase()
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userRoleError) {
      throw userRoleError;
    }

    if (userRole.role !== 'admin') {
      await getSupabase().auth.signOut();

      throw new Error('Bạn không có quyền truy cập vào hệ thống này');
    }

    return data;
  }

  async getSession() {
    const { data, error } = await getSupabase().auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  }

  onAuthStateChange(callback) {
    const { data } = getSupabase().auth.onAuthStateChange(callback);

    return () => data.subscription.unsubscribe();
  }

  async signOut() {
    const { error } = await getSupabase().auth.signOut();

    if (error) {
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;
