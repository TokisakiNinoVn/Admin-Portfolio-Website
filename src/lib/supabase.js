// src/lib/supabase.js

import { createClient } from '@supabase/supabase-js';

let client = null;

// Khởi tạo lười để quá trình build (prerender) không cần biến môi trường
export function getSupabase() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }

  return client;
}
