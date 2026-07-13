const SUPABASE_URL = "https://knkknbgaiqogswadsdnt.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_NxStPGjlh-mhRwrmOGdacw_4axSJPcL";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
