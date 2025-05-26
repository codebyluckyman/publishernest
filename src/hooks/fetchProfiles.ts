import { supabase } from "@/integrations/supabase/client";

export async function fetchProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, online_status");

  if (error) throw error;
  return data;
}
