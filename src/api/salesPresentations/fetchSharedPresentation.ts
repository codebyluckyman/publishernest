
import { supabase } from '@/integrations/supabase/client';
import { SalesPresentation, PresentationDisplaySettings, CardColumn, DialogColumn } from '@/types/salesPresentation';

export async function fetchSharedPresentation(accessCode: string): Promise<SalesPresentation | null> {
  try {
    // Call the database function directly instead of using RPC
    const { data, error } = await supabase
      .from('sales_presentations')
      .select('*')
      .eq('access_code', accessCode)
      .eq('status', 'published')
      .filter('expires_at', 'gt', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Error fetching shared presentation:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }

    // Process display settings to ensure it has the expected format
    const displaySettings = data.display_settings || {};
    const processedDisplaySettings: PresentationDisplaySettings = {
      cardColumns: Array.isArray(displaySettings.cardColumns) 
        ? displaySettings.cardColumns as CardColumn[]
        : (Array.isArray(displaySettings.displayColumns) 
            ? displaySettings.displayColumns as CardColumn[]
            : ['price', 'isbn13', 'publisher']),
      dialogColumns: Array.isArray(displaySettings.dialogColumns) 
        ? displaySettings.dialogColumns as DialogColumn[]
        : (Array.isArray(displaySettings.displayColumns) 
            ? [...(displaySettings.displayColumns as DialogColumn[]), 'synopsis' as DialogColumn] 
            : ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'])
    };

    // Increment access count in presentation_shares
    try {
      await supabase.rpc('increment_presentation_share_access', { code: accessCode });
    } catch (error) {
      // Non-critical error, just log it
      console.error('Error incrementing presentation access count:', error);
    }

    return {
      ...data,
      display_settings: processedDisplaySettings
    } as SalesPresentation;
  } catch (error) {
    console.error('Failed to fetch shared presentation:', error);
    return null;
  }
}
