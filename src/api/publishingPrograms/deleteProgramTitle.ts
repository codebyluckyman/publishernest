
import { supabase } from "@/integrations/supabase/client";

export async function deleteProgramTitle(programTitleId: string): Promise<void> {
  const { error } = await supabase
    .from('program_titles')
    .delete()
    .eq('id', programTitleId);

  if (error) {
    throw new Error(`Error deleting program title: ${error.message}`);
  }
}
