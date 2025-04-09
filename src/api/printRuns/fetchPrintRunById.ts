
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { PrintRun } from '@/types/printRun';

export async function fetchPrintRunById(id: string): Promise<PrintRun> {
  const { data, error } = await supabaseCustom
    .from('print_runs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching print run:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('Print run not found');
  }

  return data as unknown as PrintRun;
}
