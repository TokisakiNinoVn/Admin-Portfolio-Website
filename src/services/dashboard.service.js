// src/services/dashboard.service.js

import { getSupabase } from '@/lib/supabase';

const TABLES = ['skill_categories', 'skills', 'friends', 'curriculum_vitae', 'app_settings'];

class DashboardService {
  async counts() {
    const results = await Promise.all(
      TABLES.map((table) =>
        getSupabase().from(table).select('*', { count: 'exact', head: true }),
      ),
    );

    return TABLES.reduce((acc, table, index) => {
      const { count, error } = results[index];

      if (error) {
        throw error;
      }

      acc[table] = count ?? 0;

      return acc;
    }, {});
  }
}

const dashboardService = new DashboardService();

export default dashboardService;
