
import { supabase } from "@/integrations/supabase/client";
import { PublishingProgram, CreatePublishingProgramInput } from "@/types/publishingProgram";

export async function createPublishingProgram(
  input: CreatePublishingProgramInput,
  organizationId: string,
  userId: string
): Promise<PublishingProgram> {
  const { data, error } = await supabase
    .from('publishing_programs')
    .insert({
      ...input,
      organization_id: organizationId,
      created_by: userId,
      tags: input.tags ? JSON.stringify(input.tags) : null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating publishing program: ${error.message}`);
  }

  return {
    ...data,
    status: data.status as 'planning' | 'active' | 'completed' | 'cancelled',
    tags: data.tags ? JSON.parse(data.tags as string) : [],
  };
}
