
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/types/organization';
import { SalesPresentation } from '@/types/salesPresentation';

interface CreateSalesPresentationParams {
  title: string;
  description?: string;
  currentOrganization: Organization;
  userId: string;
  coverImageUrl?: string;
}

export async function createSalesPresentation({
  title,
  description,
  currentOrganization,
  userId,
  coverImageUrl
}: CreateSalesPresentationParams): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('sales_presentations')
      .insert({
        title,
        description,
        organization_id: currentOrganization.id,
        created_by: userId,
        status: 'draft',
        cover_image_url: coverImageUrl
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating sales presentation:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Failed to create sales presentation:', error);
    return null;
  }
}
