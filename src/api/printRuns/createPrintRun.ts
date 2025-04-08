
import { supabase } from '@/integrations/supabase/client';
import { PrintRun } from '@/types/printRun';

interface CreatePrintRunInput {
  title: string;
  description?: string;
  organizationId: string;
  createdBy: string;
  status?: 'draft' | 'in_progress' | 'completed';
}

export async function createPrintRun({
  title,
  description,
  organizationId,
  createdBy,
  status = 'draft',
}: CreatePrintRunInput): Promise<string> {
  const { data, error } = await supabase
    .from('print_runs')
    .insert({
      title,
      description,
      organization_id: organizationId,
      created_by: createdBy,
      status,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating print run:', error);
    throw error;
  }

  return data.id;
}
