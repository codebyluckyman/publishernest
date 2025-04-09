
import { supabase } from '@/integrations/supabase/client';

export async function deleteSalesPresentation(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
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
