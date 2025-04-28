
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { SalesPresentation, PresentationDisplaySettings } from '@/types/salesPresentation';

// Type guard to verify the shape of display_settings for legacy format
function hasDisplayColumns(obj: any): obj is { displayColumns: string[] } {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.displayColumns)
  );
}

// Type guard for the new format
function hasCardAndDialogColumns(obj: any): obj is PresentationDisplaySettings {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.cardColumns) &&
    Array.isArray(obj.dialogColumns)
  );
}

// Default display settings to use if none found or invalid
const defaultDisplaySettings: PresentationDisplaySettings = {
  cardColumns: ["price", "isbn13", "publisher", "publication_date"],
  dialogColumns: ["price", "isbn13", "publisher", "publication_date", "synopsis"]
};

export async function fetchSalesPresentationById(id: string): Promise<SalesPresentation | null> {
  try {
    const { data, error } = await supabaseCustom
      .from('sales_presentations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching sales presentation:', error);
      return null;
    }

    // Process display settings to ensure compatibility
    let displaySettings: PresentationDisplaySettings;
    
    if (data.display_settings) {
      try {
        const settings = data.display_settings;
        
        // Check if it's in the new format
        if (hasCardAndDialogColumns(settings)) {
          displaySettings = settings as PresentationDisplaySettings;
        }
        // Check if it's in the legacy format and convert
        else if (hasDisplayColumns(settings)) {
          displaySettings = {
            cardColumns: settings.displayColumns,
            dialogColumns: [...settings.displayColumns, 'synopsis']
          };
        } else {
          // Unknown format, use defaults
          displaySettings = defaultDisplaySettings;
        }
      } catch (e) {
        console.warn('Invalid display_settings format, using defaults', e);
        displaySettings = defaultDisplaySettings;
      }
    } else {
      displaySettings = defaultDisplaySettings;
    }

    // Cast the raw data to our SalesPresentation type with validated display settings
    return {
      ...data,
      display_settings: displaySettings
    } as SalesPresentation;
  } catch (error) {
    console.error('Failed to fetch sales presentation:', error);
    return null;
  }
}
