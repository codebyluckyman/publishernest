
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { SalesPresentation } from '@/types/salesPresentation';

export async function fetchSalesPresentationById(id: string): Promise<SalesPresentation | null> {
  try {
    const { data, error } = await supabaseCustom
      .from('sales_presentations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching sales presentation:', error);
      return null;
    }

    return data as SalesPresentation;
  } catch (error) {
    console.error('Failed to fetch sales presentation:', error);
    return null;
  }
}
