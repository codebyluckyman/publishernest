
import { supabase } from "@/integrations/supabase/client";
import { ProgramFormat } from "@/types/publishingProgram";

export async function fetchProgramFormats(programId: string): Promise<ProgramFormat[]> {
  const { data, error } = await supabase
    .from('program_formats')
    .select(`
      *,
      format:formats(id, format_name, description)
    `)
    .eq('program_id', programId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Error fetching program formats: ${error.message}`);
  }

  return data || [];
}
