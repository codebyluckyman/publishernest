
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { PresentationDisplaySettings, PresentationViewMode } from '@/types/salesPresentation';

interface UpdateSalesPresentationParams {
  id: string;
  title?: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
  coverImageUrl?: string;
  expiresAt?: string;
  displaySettings?: PresentationDisplaySettings;
}

export async function updateSalesPresentation({
  id,
  title,
  description,
  status,
  coverImageUrl,
  expiresAt,
  displaySettings,
}: UpdateSalesPresentationParams): Promise<boolean> {
  try {
    const updates: Record<string, any> = {};
    
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (coverImageUrl !== undefined) updates.cover_image_url = coverImageUrl;
    if (expiresAt !== undefined) updates.expires_at = expiresAt;
    
    if (displaySettings !== undefined) {
      // Ensure displaySettings has the expected structure
      const updatedSettings = { ...displaySettings };
      
      // Set default view if not provided
      if (!updatedSettings.defaultView) {
        updatedSettings.defaultView = 'card' as PresentationViewMode;
      }
      
      updates.display_settings = updatedSettings;
    }
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { error } = await supabaseCustom
      .from('sales_presentations')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating sales presentation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update sales presentation:', error);
    return false;
  }
}
