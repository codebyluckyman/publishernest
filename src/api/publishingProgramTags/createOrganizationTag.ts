
import { supabase } from "@/integrations/supabase/client";
import { ProgramTag } from "@/types/publishingProgram";
import { OrganizationTag } from "./fetchOrganizationTags";

export async function createOrganizationTag(
  organizationId: string,
  tag: ProgramTag
): Promise<OrganizationTag> {
  const { data, error } = await supabase
    .from('publishing_program_tags')
    .insert({
      organization_id: organizationId,
      name: tag.name,
      color: tag.color,
      usage_count: 1
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating organization tag: ${error.message}`);
  }

  return data;
}
