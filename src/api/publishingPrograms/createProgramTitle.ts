
import { supabase } from "@/integrations/supabase/client";
import { ProgramTitle, CreateProgramTitleInput } from "@/types/publishingProgram";

export async function createProgramTitle(input: CreateProgramTitleInput): Promise<ProgramTitle> {
  const { data, error } = await supabase
    .from('program_titles')
    .insert({
      program_format_id: input.program_format_id,
      product_id: input.product_id,
      working_title: input.working_title,
      target_isbn: input.target_isbn,
      planned_pub_date: input.planned_pub_date,
      content_brief: input.content_brief,
      target_quantity: input.target_quantity,
      estimated_cost: input.estimated_cost,
      notes: input.notes,
    })
    .select(`
      *,
      product:products(id, title, isbn13)
    `)
    .single();

  if (error) {
    throw new Error(`Error creating program title: ${error.message}`);
  }

  return data;
}
