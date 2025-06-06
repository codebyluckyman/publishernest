
import { supabase } from "@/integrations/supabase/client";
import { ProgramTitle } from "@/types/publishingProgram";

export async function fetchProgramTitles(programFormatId: string): Promise<ProgramTitle[]> {
  const { data, error } = await supabase
    .from('program_titles')
    .select(`
      *,
      product:products(id, title, isbn13)
    `)
    .eq('program_format_id', programFormatId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Error fetching program titles: ${error.message}`);
  }

  return (data || []).map(item => ({
    ...item,
    status: item.status as 'concept' | 'editorial' | 'design' | 'production' | 'published'
  }));
}
