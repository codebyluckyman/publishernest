
import { supabase } from "@/integrations/supabase/client";

export async function deleteProgramFormat(programFormatId: string): Promise<void> {
  const { error } = await supabase
    .from('program_formats')
    .delete()
    .eq('id', programFormatId);

  if (error) {
    throw new Error(`Error deleting program format: ${error.message}`);
  }
}
