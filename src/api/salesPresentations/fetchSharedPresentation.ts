
import { supabaseCustom } from "@/integrations/supabase/client-custom";
import { PresentationDisplaySettings, CardColumn, DialogColumn } from "@/types/salesPresentation";

// Default columns to use if none are provided in display settings
const defaultCardColumns: CardColumn[] = ['price', 'isbn13', 'publisher'];
const defaultDialogColumns: DialogColumn[] = ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'];

export async function fetchSharedPresentation(accessCode: string) {
  try {
    // Call the public function that doesn't require authentication
    const { data, error } = await supabaseCustom.rpc('get_public_presentation', {
      access_code: accessCode
    });

    if (error) throw error;
    if (!data || data.length === 0) {
      return { data: null, error: new Error('Presentation not found') };
    }
    
    const presentation = data[0];

    // Ensure display_settings is treated as an object
    const displaySettings = typeof presentation.display_settings === 'object' 
      ? presentation.display_settings as Record<string, any>
      : {};
    
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
    await supabaseCustom.rpc('track_presentation_public_access', {
      p_presentation_id: presentation.id,
      p_view_id: accessCode
    }).catch(err => console.error('Failed to increment access count:', err));
    
    return { data: presentation, error: null };
  } catch (error) {
    console.error('Error fetching shared presentation:', error);
    return { data: null, error };
  }
}
