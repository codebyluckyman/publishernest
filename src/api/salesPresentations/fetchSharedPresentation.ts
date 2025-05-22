
import { supabaseCustom } from "@/integrations/supabase/client-custom";
import { PresentationDisplaySettings, CardColumn, DialogColumn } from "@/types/salesPresentation";

// Default columns to use if none are provided in display settings
const defaultCardColumns: CardColumn[] = ['price', 'isbn13', 'publisher'];
const defaultDialogColumns: DialogColumn[] = ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'];

export async function fetchSharedPresentation(shareToken: string) {
  try {
    // First, find the share record by token
    const { data: shareData, error: shareError } = await supabaseCustom
      .from('presentation_shares')
      .select('presentation_id, expires_at, access_count')
      .eq('share_token', shareToken)
      .single();
    
    if (shareError || !shareData) {
      console.error('Error fetching share record:', shareError);
      return { data: null, error: new Error('Share link not found or expired') };
    }
    
    // Check if share has expired
    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return { data: null, error: new Error('Share link has expired') };
    }
    
    // Now fetch the presentation with the found ID
    const { data: presentations, error: presentationError } = await supabaseCustom
      .from('sales_presentations')
      .select('*')
      .eq('id', shareData.presentation_id)
      .eq('status', 'published')
      .limit(1);

    if (presentationError || !presentations || presentations.length === 0) {
      return { data: null, error: new Error('Presentation not found') };
    }
    
    const presentation = presentations[0];
    
    // Create default display settings
    const defaultDisplaySettings: PresentationDisplaySettings = {
      cardColumns: defaultCardColumns,
      dialogColumns: defaultDialogColumns,
      defaultView: 'card',
      features: {}
    };
    
    // Type check and safely extract display settings
    let processedSettings: PresentationDisplaySettings = { ...defaultDisplaySettings };
    
    if (presentation.display_settings) {
      // Ensure display_settings is an object before proceeding
      const displaySettings = 
        typeof presentation.display_settings === 'object' && presentation.display_settings !== null
          ? presentation.display_settings 
          : {};
      
      // Try to extract cardColumns
      if (displaySettings && 'cardColumns' in displaySettings && 
          Array.isArray(displaySettings.cardColumns) && displaySettings.cardColumns.length > 0) {
        processedSettings.cardColumns = displaySettings.cardColumns as CardColumn[];
      } else if (displaySettings && 'displayColumns' in displaySettings && 
                Array.isArray(displaySettings.displayColumns)) {
        // Fall back to displayColumns (legacy field)
        processedSettings.cardColumns = displaySettings.displayColumns as CardColumn[];
      }

      // Try to extract dialogColumns
      if (displaySettings && 'dialogColumns' in displaySettings && 
          Array.isArray(displaySettings.dialogColumns) && displaySettings.dialogColumns.length > 0) {
        processedSettings.dialogColumns = displaySettings.dialogColumns as DialogColumn[];
      } else if (displaySettings && 'displayColumns' in displaySettings && 
                Array.isArray(displaySettings.displayColumns)) {
        // Fall back to displayColumns + synopsis (legacy field)
        processedSettings.dialogColumns = [
          ...(displaySettings.displayColumns as DialogColumn[]),
          'synopsis' as DialogColumn
        ];
      }
      
      // Extract defaultView if it exists
      if (displaySettings && 'defaultView' in displaySettings && 
          typeof displaySettings.defaultView === 'string') {
        processedSettings.defaultView = displaySettings.defaultView;
      }
      
      // Extract features if they exist
      if (displaySettings && 'features' in displaySettings && 
          typeof displaySettings.features === 'object' && displaySettings.features !== null) {
        processedSettings.features = displaySettings.features;
      }
    }

    // Update the display_settings with the processed version
    presentation.display_settings = processedSettings;
    
    // Call the function to increment the access count
    await supabaseCustom
      .from('presentation_shares')
      .update({ 
        access_count: shareData.access_count ? shareData.access_count + 1 : 1,
        last_accessed: new Date().toISOString()
      })
      .eq('share_token', shareToken);
    
    return { data: presentation, error: null };
  } catch (error) {
    console.error('Error fetching shared presentation:', error);
    return { data: null, error };
  }
}
