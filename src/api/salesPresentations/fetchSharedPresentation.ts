
import { supabaseCustom } from "@/integrations/supabase/client-custom";
import { PresentationDisplaySettings, CardColumn, DialogColumn } from "@/types/salesPresentation";

// Default columns to use if none are provided in display settings
const defaultCardColumns: CardColumn[] = ['price', 'isbn13', 'publisher'];
const defaultDialogColumns: DialogColumn[] = ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'];

export async function fetchSharedPresentation(accessCode: string) {
  try {
    // First, call the stored function to fetch the presentation
    const { data, error } = await supabaseCustom.rpc('fetch_shared_presentation', {
      access_code: accessCode
    });

    if (error) throw error;
    if (!data || data.length === 0) {
      return { data: null, error: new Error('Presentation not found') };
    }
    
    const presentation = data[0];

    // Ensure display_settings has both cardColumns and dialogColumns
    const displaySettings = presentation.display_settings || {};
    
    // Create a properly typed displaySettings object
    const processedDisplaySettings: PresentationDisplaySettings = {
      cardColumns: Array.isArray(displaySettings.cardColumns) 
        ? displaySettings.cardColumns
        : (Array.isArray(displaySettings.displayColumns) 
            ? displaySettings.displayColumns 
            : defaultCardColumns),
      
      dialogColumns: Array.isArray(displaySettings.dialogColumns) 
        ? displaySettings.dialogColumns
        : (Array.isArray(displaySettings.displayColumns) 
            ? [...displaySettings.displayColumns, 'synopsis'] 
            : defaultDialogColumns)
    };

    // Update the display_settings with the processed version
    presentation.display_settings = processedDisplaySettings;
    
    // Call the function to increment the access count
    await supabaseCustom.rpc('increment_presentation_share_access', {
      code: accessCode
    }).catch(err => console.error('Failed to increment access count:', err));
    
    return { data: presentation, error: null };
  } catch (error) {
    console.error('Error fetching shared presentation:', error);
    return { data: null, error };
  }
}
