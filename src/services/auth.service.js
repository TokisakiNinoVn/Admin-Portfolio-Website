// src/services/auth.service.js

import supabase from '@/apis/supabase';

class AuthService {
  async signInWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const userId = data.user.id;

    const { data: userRole, error: userRoleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userRoleError) {
      throw userRoleError;
    }

    if (userRole.role !== 'admin') {
      await supabase.auth.signOut();

      throw new Error('Bạn không có quyền truy cập vào hệ thống này');
    }

    return data;
  }

  // test
  // async test() {
  //   const { data, error } = await supabase
  //     .from('users')
  //     .select('*');
  //   console.log('users:', data);
  //   console.log('error:', error);
  // }
}

export default new AuthService();
