
import { supabase } from '@/integrations/supabase/client';
import { ProductSavedView } from '@/types/productSavedView';

export async function setDefaultView(id: string, organizationId: string): Promise<ProductSavedView> {
  // First, unset any existing defaults
  await unsetExistingDefaults(organizationId);
  
  // Then set the new default
  const { data, error } = await supabase
    .from('product_saved_views')
    .update({ is_default: true })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error setting default view:', error);
    throw new Error(error.message);
  }

  return data as ProductSavedView;
}

async function unsetExistingDefaults(organizationId: string): Promise<void> {
  const { error } = await supabase
    .from('product_saved_views')
    .update({ is_default: false })
    .eq('is_default', true)
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Error unsetting existing default views:', error);
    throw new Error(error.message);
  }
}
