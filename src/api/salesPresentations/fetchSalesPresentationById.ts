
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { SalesPresentation, PresentationDisplaySettings } from '@/types/salesPresentation';

// Type guard to verify the shape of display_settings
function isPresentationDisplaySettings(obj: any): obj is PresentationDisplaySettings {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.displayColumns)
  );
}

// Default display settings to use if none found or invalid
const defaultDisplaySettings: PresentationDisplaySettings = {
  displayColumns: ["price", "isbn13", "publisher", "publication_date"]
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

    // Safely handle display_settings with type validation
    let displaySettings: PresentationDisplaySettings;
    try {
      displaySettings = isPresentationDisplaySettings(data.display_settings) 
        ? data.display_settings as PresentationDisplaySettings
        : defaultDisplaySettings;
    } catch (e) {
      console.warn('Invalid display_settings format, using defaults', e);
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
