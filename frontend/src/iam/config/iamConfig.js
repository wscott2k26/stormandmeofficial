const SUPABASE_URL = /^https:\/\/[a-z0-9-]+\.supabase\.co$/;

export function readIamConfig(env = process.env) {
  const supabaseUrl = String(env.REACT_APP_SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const supabaseAnonKey = String(env.REACT_APP_SUPABASE_ANON_KEY || "").trim();
  const errors = [];

  if (!SUPABASE_URL.test(supabaseUrl)) {
    errors.push("REACT_APP_SUPABASE_URL must be an https://*.supabase.co URL.");
  }
  if (!supabaseAnonKey) {
    errors.push("REACT_APP_SUPABASE_ANON_KEY is required.");
  }

  return {
    isConfigured: errors.length === 0,
    supabaseUrl,
    supabaseAnonKey,
    errors,
  };
}

export const iamConfig = readIamConfig();
