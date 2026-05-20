// src/lib/supabase.js
// Kết nối Supabase — import file này ở mọi nơi cần dùng database

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong file .env.local');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,       // Giữ đăng nhập sau khi tắt trình duyệt
        detectSessionInUrl: true,
    },
    realtime: {
        params: { eventsPerSecond: 10 },
    },
});
