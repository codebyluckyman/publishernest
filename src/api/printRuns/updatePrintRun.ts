
import { supabase } from '@/integrations/supabase/client';

interface UpdatePrintRunInput {
  id: string;
  title?: string;
  description?: string;
  status?: 'draft' | 'in_progress' | 'completed';
}

export async function updatePrintRun({
  id,
  title,
  description,
  status,
}: UpdatePrintRunInput): Promise<void> {
  const updateData: any = {};
  
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;

  const { error } = await supabase
    .from('print_runs')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating print run:', error);
    throw error;
  }
}
