
import { supabase } from "@/integrations/supabase/client";
import { OrganizationTag } from "./fetchOrganizationTags";

export async function getTagSuggestions(
  organizationId: string,
  searchTerm: string
): Promise<OrganizationTag[]> {
  const { data, error } = await supabase
    .from('publishing_program_tags')
    .select('*')
    .eq('organization_id', organizationId)
    .ilike('name', `%${searchTerm}%`)
    .order('usage_count', { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Error fetching tag suggestions: ${error.message}`);
  }

  return data || [];
}
