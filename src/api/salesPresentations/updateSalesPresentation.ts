
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { CardGridLayout, PresentationDisplaySettings, PresentationViewMode, CardWidthType } from '@/types/salesPresentation';

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
      
      console.log("Update Sales Presentation - Display settings before processing:", updatedSettings);
      
      // Ensure features object exists with defaults
      if (!updatedSettings.features) {
        updatedSettings.features = {
          enabledViews: ['card', 'table', 'carousel', 'kanban'],
          allowViewToggle: true,
          showProductDetails: true,
          showPricing: true,
          allowDownload: false,
          cardWidthType: 'responsive' as CardWidthType,
          kanbanGroupByField: 'publisher_name'
        };
      } else {
        // Ensure required feature flags exist with defaults
        updatedSettings.features = {
          enabledViews: updatedSettings.features.enabledViews !== undefined 
            ? updatedSettings.features.enabledViews 
            : ['card', 'table', 'carousel', 'kanban'],
          allowViewToggle: updatedSettings.features.allowViewToggle !== false,
          showProductDetails: updatedSettings.features.showProductDetails !== false,
          showPricing: updatedSettings.features.showPricing !== false,
          allowDownload: updatedSettings.features.allowDownload || false,
          cardWidthType: updatedSettings.features.cardWidthType || 'responsive',
          kanbanGroupByField: updatedSettings.features.kanbanGroupByField || 'publisher_name',
          ...updatedSettings.features
        };
        
        // Process card width settings
        if (updatedSettings.features.cardWidthType === 'fixed') {
          // Ensure fixedCardWidth has a default value if not provided
          if (!updatedSettings.features.fixedCardWidth) {
            updatedSettings.features.fixedCardWidth = 320;
          }
        }
        
        // Ensure cardGridLayout has proper values if provided (only needed for responsive mode)
        if (updatedSettings.features.cardWidthType === 'responsive') {
          const gridLayout = updatedSettings.features.cardGridLayout as CardGridLayout;
          
          if (gridLayout) {
            console.log("Update Sales Presentation - Grid layout before processing:", gridLayout);
            
            // Apply default values for any missing breakpoints
            updatedSettings.features.cardGridLayout = {
              sm: gridLayout.sm || 1,
              md: gridLayout.md || 2,
              lg: gridLayout.lg || 3,
              xl: gridLayout.xl || 4,
              xxl: gridLayout.xxl || 5,
            } as CardGridLayout;
            
            console.log("Update Sales Presentation - Grid layout after processing:", updatedSettings.features.cardGridLayout);
          }
        }
      }
      
      console.log("Update Sales Presentation - Final display settings:", updatedSettings);
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
