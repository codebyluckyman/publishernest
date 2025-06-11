
import { supabase } from "@/integrations/supabase/client";
import { PublishingProgram } from "@/types/publishingProgram";

export async function fetchPublishingPrograms(organizationId: string): Promise<PublishingProgram[]> {
  const { data, error } = await supabase
    .from('publishing_programs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching publishing programs: ${error.message}`);
  }

  return (data || []).map(item => ({
    ...item,
    status: item.status as 'planning' | 'active' | 'completed' | 'cancelled',
    tags: item.tags ? JSON.parse(item.tags as string) : [],
  }));
}
