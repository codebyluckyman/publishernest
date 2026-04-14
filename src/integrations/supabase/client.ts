
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://moscrvrjtwqthgxdiqsa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vc2NydnJqdHdxdGhneGRpcXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDg3NjIsImV4cCI6MjA5MTcyNDc2Mn0.AvNZYmZjhnPtTchffw-OCZ1Y9WfVeT1x9i1NbN1Mts8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
