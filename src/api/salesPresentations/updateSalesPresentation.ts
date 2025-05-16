
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { CardGridLayout, PresentationDisplaySettings, PresentationViewMode, CardWidthType, CarouselSettings } from '@/types/salesPresentation';

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
      
      // Define default carousel settings
      const defaultCarouselSettings: CarouselSettings = {
        slidesPerView: { sm: 1, md: 2, lg: 3 },
        autoplay: false,
        autoplayDelay: 3000,
        slideHeight: 192,
        showIndicators: true,
        cardLayout: 'standard',
        layoutOptions: {
          showCover: true,
          showSynopsis: true,
          showSpecsTable: true,
          imageSide: 'left',
          includeTableBorders: true,
          alternateRowColors: false,
        },
        sectionStyles: {
          useBorders: true,
          headerBackground: 'bg-gray-50',
          sectionPadding: 4,
        }
      };
      
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
        // IMPORTANT: First spread the updated features, then apply defaults for missing props
        // This ensures user settings take precedence over defaults
        updatedSettings.features = {
          // Default values
          enabledViews: ['card', 'table', 'carousel', 'kanban'],
          allowViewToggle: true,
          showProductDetails: true,
          showPricing: true,
          allowDownload: false,
          cardWidthType: 'responsive' as CardWidthType,
          kanbanGroupByField: 'publisher_name',
          // Override with provided values (moved this spread AFTER the defaults)
          ...updatedSettings.features
        };
        
        // Process carousel settings specifically to ensure nested objects are preserved
        if (updatedSettings.features.carouselSettings) {
          console.log("Update Sales Presentation - Carousel settings before processing:", updatedSettings.features.carouselSettings);
          
          // Merge carousel settings with defaults, preserving nested objects
          updatedSettings.features.carouselSettings = {
            ...defaultCarouselSettings,
            ...updatedSettings.features.carouselSettings,
            // Handle nested objects separately to ensure they merge properly
            layoutOptions: {
              ...defaultCarouselSettings.layoutOptions,
              ...(updatedSettings.features.carouselSettings.layoutOptions || {})
            },
            sectionStyles: {
              ...defaultCarouselSettings.sectionStyles,
              ...(updatedSettings.features.carouselSettings.sectionStyles || {})
            }
          };
          
          console.log("Update Sales Presentation - Carousel settings after processing:", updatedSettings.features.carouselSettings);
        } else {
          // If no carousel settings provided, use defaults
          updatedSettings.features.carouselSettings = defaultCarouselSettings;
        }
        
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
