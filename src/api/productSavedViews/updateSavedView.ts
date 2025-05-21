
import { supabase } from '@/integrations/supabase/client';
import { ProductSavedView, UpdateProductSavedViewParams } from '@/types/productSavedView';

export async function updateSavedView(
  params: UpdateProductSavedViewParams
): Promise<ProductSavedView> {
  // If this view is being set as default, unset any existing default views
  if (params.is_default) {
    await unsetExistingDefaults();
  }

  const updateData: any = {};
  if (params.name !== undefined) updateData.name = params.name;
  if (params.description !== undefined) updateData.description = params.description;
  if (params.filters !== undefined) updateData.filters = params.filters as any;
  if (params.search_query !== undefined) updateData.search_query = params.search_query;
  if (params.is_default !== undefined) updateData.is_default = params.is_default;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('product_saved_views')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating saved view:', error);
    throw new Error(error.message);
  }

  // Convert the returned data to our ProductSavedView type
  return {
    ...data,
    filters: data.filters as unknown as ProductSavedView['filters']
  } as ProductSavedView;
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
