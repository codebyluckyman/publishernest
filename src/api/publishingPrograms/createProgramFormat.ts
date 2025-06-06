
import { supabase } from "@/integrations/supabase/client";
import { ProgramFormat, CreateProgramFormatInput } from "@/types/publishingProgram";

export async function createProgramFormat(input: CreateProgramFormatInput): Promise<ProgramFormat> {
  // Debug: Check auth state before making the request
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  console.log('Auth session:', session);
  console.log('Auth user:', user);
  console.log('Session error:', sessionError);
  console.log('User error:', userError);
  
  if (!session || !user) {
    throw new Error('User must be authenticated to create program format');
  }

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
    console.error('Database error:', error);
    throw new Error(`Error creating program format: ${error.message}`);
  }

  return {
    ...data,
    status: data.status as 'concept' | 'approved' | 'in_production' | 'completed'
  };
}
