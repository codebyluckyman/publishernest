
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
    
    // Ensure display_settings has both cardColumns and dialogColumns
    const displaySettings = presentation.display_settings || {};
    
    // Create a properly typed displaySettings object
    const processedDisplaySettings: PresentationDisplaySettings = {
      cardColumns: Array.isArray(displaySettings?.cardColumns) 
        ? displaySettings.cardColumns as CardColumn[]
        : (Array.isArray(displaySettings?.displayColumns) 
            ? displaySettings.displayColumns as CardColumn[] 
            : defaultCardColumns),
      
      dialogColumns: Array.isArray(displaySettings?.dialogColumns) 
        ? displaySettings.dialogColumns as DialogColumn[]
        : (Array.isArray(displaySettings?.displayColumns) 
            ? [...(displaySettings.displayColumns as DialogColumn[]), 'synopsis'] 
            : defaultDialogColumns)
    };

    // Update the display_settings with the processed version
    presentation.display_settings = processedDisplaySettings;
    
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
