
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { SalesPresentation, PresentationDisplaySettings, CardColumn, DialogColumn } from '@/types/salesPresentation';

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

// Valid column values that can be used
const validCardColumns: CardColumn[] = ['price', 'isbn13', 'publisher', 'publication_date', 'format'];
const validDialogColumns: DialogColumn[] = ['price', 'isbn13', 'publisher', 'publication_date', 'format', 'physical_properties', 'carton_dimensions', 'synopsis'];

// Default display settings to use if none found or invalid
const defaultDisplaySettings: PresentationDisplaySettings = {
  cardColumns: ["price", "isbn13", "publisher", "publication_date"],
  dialogColumns: ["price", "isbn13", "publisher", "publication_date", "synopsis"]
};

// Function to sanitize and validate column values
function sanitizeCardColumns(columns: any[]): CardColumn[] {
  if (!Array.isArray(columns)) return defaultDisplaySettings.cardColumns;
  return columns.filter(col => validCardColumns.includes(col as CardColumn)) as CardColumn[];
}

function sanitizeDialogColumns(columns: any[]): DialogColumn[] {
  if (!Array.isArray(columns)) return defaultDisplaySettings.dialogColumns;
  return columns.filter(col => validDialogColumns.includes(col as DialogColumn)) as DialogColumn[];
}

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
          displaySettings = {
            cardColumns: sanitizeCardColumns(settings.cardColumns),
            dialogColumns: sanitizeDialogColumns(settings.dialogColumns)
          };
        }
        // Check if it's in the legacy format and convert
        else if (hasDisplayColumns(settings)) {
          const legacyColumns = settings.displayColumns.filter(
            col => validCardColumns.includes(col as CardColumn)
          ) as CardColumn[];
          
          const dialogCols = [...legacyColumns];
          if (!dialogCols.includes('synopsis')) {
            dialogCols.push('synopsis');
          }
          
          displaySettings = {
            cardColumns: legacyColumns,
            dialogColumns: dialogCols as DialogColumn[]
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
