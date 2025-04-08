
import { supabase } from '@/integrations/supabase/client';
import { PrintRun } from '@/types/printRun';

interface FetchPrintRunsOptions {
  organizationId: string;
  status?: string;
}

export async function fetchPrintRuns({
  organizationId,
  status,
}: FetchPrintRunsOptions): Promise<PrintRun[]> {
  let query = supabase
    .from('print_runs')
    .select('*')
    .eq('organization_id', organizationId);

  // Add optional status filter
  if (status) {
    query = query.eq('status', status);
  }

  // Order by created date, newest first
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching print runs:', error);
    throw error;
  }

  return data || [];
}
