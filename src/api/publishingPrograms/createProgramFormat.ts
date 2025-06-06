
import { supabase } from "@/integrations/supabase/client";
import { ProgramFormat, CreateProgramFormatInput } from "@/types/publishingProgram";

export async function createProgramFormat(input: CreateProgramFormatInput): Promise<ProgramFormat> {
  const { data, error } = await supabase
    .from('program_formats')
    .insert({
      program_id: input.program_id,
      format_id: input.format_id,
      target_quantity: input.target_quantity,
      budget_allocation: input.budget_allocation,
      timeline_start: input.timeline_start,
      timeline_end: input.timeline_end,
      notes: input.notes,
    })
    .select(`
      *,
      format:formats(id, format_name)
    `)
    .single();

  if (error) {
    throw new Error(`Error creating program format: ${error.message}`);
  }

  return {
    ...data,
    status: data.status as 'concept' | 'approved' | 'in_production' | 'completed'
  };
}
