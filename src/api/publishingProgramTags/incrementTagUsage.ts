
import { supabase } from "@/integrations/supabase/client";

export async function incrementTagUsage(tagId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_tag_usage', {
    tag_id: tagId
  });

  if (error) {
    throw new Error(`Error incrementing tag usage: ${error.message}`);
  }
}
