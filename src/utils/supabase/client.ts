import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables. Please check your .env.local file.");
}

// Fallback to dummy values to prevent top-level runtime crash if env variables are missing
const safeUrl = supabaseUrl || "https://placeholder-project.supabase.co";
const safeKey = supabaseAnonKey || "placeholder-anon-key-preventing-crash";

export const supabase = createClient(safeUrl, safeKey);
