
import { supabase } from '@/integrations/supabase/client';
import { ProductSavedView } from '@/types/productSavedView';
import { Organization } from '@/types/organization';

export async function fetchSavedViews(
  currentOrganization: Organization | null
): Promise<ProductSavedView[]> {
  if (!currentOrganization) {
    return [];
  }

  const { data, error } = await supabase
    .from('product_saved_views')
    .select('*')
    .eq('organization_id', currentOrganization.id)
    .order('name');

  if (error) {
    console.error('Error fetching saved views:', error);
    throw new Error(error.message);
  }

  // Convert the returned data to our ProductSavedView type
  return data.map(item => ({
    ...item,
    filters: item.filters as unknown as ProductSavedView['filters']
  })) as ProductSavedView[];
}
