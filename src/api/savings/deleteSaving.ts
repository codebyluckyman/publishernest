
import { supabase } from "@/integrations/supabase/client";

export async function deleteSaving(id: string): Promise<void> {
  const { error } = await supabase
    .from('savings')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
