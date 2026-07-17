// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Lấy thông tin từ biến môi trường (Vite yêu cầu tiền tố VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Kiểm tra biến môi trường để tránh lỗi runtime nếu quên config
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials missing. Check your .env file.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
