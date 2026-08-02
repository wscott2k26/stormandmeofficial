import { createClient } from "@supabase/supabase-js";
import { iamConfig } from "../config/iamConfig";

export const supabase = iamConfig.isConfigured
  ? createClient(iamConfig.supabaseUrl, iamConfig.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(`I AM configuration is incomplete: ${iamConfig.errors.join(" ")}`);
  }
  return supabase;
}
