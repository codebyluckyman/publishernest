
import { supabase } from '@/integrations/supabase/client';

export async function deleteSavedView(id: string): Promise<void> {
  const { error } = await supabase
    .from('product_saved_views')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting saved view:', error);
    throw new Error(error.message);
  }
}
