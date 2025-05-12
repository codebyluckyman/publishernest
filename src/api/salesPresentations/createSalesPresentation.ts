
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { Organization } from '@/types/organization';
import { PresentationDisplaySettings, CardColumn, DialogColumn, PresentationViewMode } from '@/types/salesPresentation';

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
    // Convert displaySettings to a plain object for database storage
    let finalDisplaySettings: Record<string, any>;
    
    if (displaySettings) {
      finalDisplaySettings = {
        cardColumns: displaySettings.cardColumns,
        dialogColumns: displaySettings.dialogColumns,
        defaultView: displaySettings.defaultView || 'card'
      };
    } else {
      // Default settings if none provided
      finalDisplaySettings = {
        cardColumns: ["price", "isbn13", "publisher"] as CardColumn[],
        dialogColumns: ["price", "isbn13", "publisher", "publication_date", "synopsis"] as DialogColumn[],
        defaultView: 'card' as PresentationViewMode
      };
    }

    const { data, error } = await supabaseCustom
      .from('sales_presentations')
      .insert({
        title,
        description,
        organization_id: currentOrganization.id,
        created_by: userId,
        status: 'draft',
        cover_image_url: coverImageUrl,
        display_settings: finalDisplaySettings
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
