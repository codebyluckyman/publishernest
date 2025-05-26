import { supabase } from "@/integrations/supabase/client";

export async function updateOnlineStatus(
  userId: string,
  status: "online" | "away" | "offline"
) {
  await supabase
    .from("profiles")
    .update({ online_status: status })
    .eq("id", userId);
}
