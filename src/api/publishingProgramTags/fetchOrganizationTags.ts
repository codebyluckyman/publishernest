
import { supabase } from "@/integrations/supabase/client";
import { ProgramTag } from "@/types/publishingProgram";

export interface OrganizationTag extends ProgramTag {
  id: string;
  organization_id: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export async function fetchOrganizationTags(organizationId: string): Promise<OrganizationTag[]> {
  const { data, error } = await supabase
    .from('publishing_program_tags')
    .select('*')
    .eq('organization_id', organizationId)
    .order('usage_count', { ascending: false })
    .order('name');

  if (error) {
    throw new Error(`Error fetching organization tags: ${error.message}`);
  }

  return data || [];
}
