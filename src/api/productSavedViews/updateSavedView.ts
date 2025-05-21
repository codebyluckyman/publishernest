
import { supabase } from '@/integrations/supabase/client';
import { ProductSavedView, UpdateProductSavedViewParams } from '@/types/productSavedView';

export async function updateSavedView(
  params: UpdateProductSavedViewParams
): Promise<ProductSavedView> {
  // If this view is being set as default, unset any existing default views
  if (params.is_default) {
    await unsetExistingDefaults();
  }

  const { data, error } = await supabase
    .from('product_saved_views')
    .update({
      name: params.name,
      description: params.description,
      filters: params.filters,
      search_query: params.search_query,
      is_default: params.is_default,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating saved view:', error);
    throw new Error(error.message);
  }

  return data as ProductSavedView;
}

async function unsetExistingDefaults(): Promise<void> {
  const { data: view, error: viewError } = await supabase
    .from('product_saved_views')
    .select('organization_id')
    .eq('is_default', true)
    .single();

  if (viewError && viewError.code !== 'PGRST116') { // PGRST116 means no rows returned
    console.error('Error getting existing default view:', viewError);
    throw new Error(viewError.message);
  }

  if (view) {
    const { error } = await supabase
      .from('product_saved_views')
      .update({ is_default: false })
      .eq('is_default', true)
      .eq('organization_id', view.organization_id);

    if (error) {
      console.error('Error unsetting existing default views:', error);
      throw new Error(error.message);
    }
  }
}
