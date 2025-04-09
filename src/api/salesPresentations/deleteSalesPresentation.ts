
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';

export async function deleteSalesPresentation(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseCustom
      .from('sales_presentations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sales presentation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete sales presentation:', error);
    return false;
  }
}
