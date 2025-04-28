
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { Organization } from '@/types/organization';
import { PresentationDisplaySettings } from '@/types/salesPresentation';

interface CreateSalesPresentationParams {
  title: string;
  description?: string;
  currentOrganization: Organization;
  userId: string;
  coverImageUrl?: string;
  displaySettings?: PresentationDisplaySettings;
}

export async function createSalesPresentation({
  title,
  description,
  currentOrganization,
  userId,
  coverImageUrl,
  displaySettings
}: CreateSalesPresentationParams): Promise<string | null> {
  try {
    const { data, error } = await supabaseCustom
      .from('sales_presentations')
      .insert({
        title,
        description,
        organization_id: currentOrganization.id,
        created_by: userId,
        status: 'draft',
        cover_image_url: coverImageUrl,
        display_settings: displaySettings || {
          displayColumns: ["price", "isbn13", "publisher", "publication_date"]
        }
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
