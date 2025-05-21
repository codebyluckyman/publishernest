
import { supabase } from '@/integrations/supabase/client';
import { CreateProductSavedViewParams, ProductSavedView } from '@/types/productSavedView';

export async function createSavedView(
  params: CreateProductSavedViewParams
): Promise<ProductSavedView> {
  // If this view is set as default, unset any existing default views
  if (params.is_default) {
    await unsetExistingDefaults(params.organization_id);
  }

  const { data, error } = await supabase
    .from('product_saved_views')
    .insert({
      name: params.name,
      description: params.description || null,
      filters: params.filters,
      search_query: params.search_query || null,
      is_default: params.is_default || false,
      organization_id: params.organization_id,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating saved view:', error);
    throw new Error(error.message);
  }

  return data as ProductSavedView;
}

async function unsetExistingDefaults(organization_id: string): Promise<void> {
  const { error } = await supabase
    .from('product_saved_views')
    .update({ is_default: false })
    .eq('is_default', true)
    .eq('organization_id', organization_id);

  if (error) {
    console.error('Error unsetting existing default views:', error);
    throw new Error(error.message);
  }
}
