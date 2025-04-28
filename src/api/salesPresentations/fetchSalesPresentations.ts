
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { SalesPresentation, PresentationDisplaySettings } from '@/types/salesPresentation';
import { Organization } from '@/types/organization';

interface FetchSalesPresentationsParams {
  currentOrganization: Organization;
  status?: string;
  limit?: number;
  page?: number;
}

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

export async function fetchSalesPresentations({
  currentOrganization,
  status,
  limit = 10,
  page = 1,
}: FetchSalesPresentationsParams): Promise<SalesPresentation[]> {
  try {
    let query = supabaseCustom
      .from('sales_presentations')
      .select('*')
      .eq('organization_id', currentOrganization.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sales presentations:', error);
      return [];
    }

    // Map and cast each presentation's display_settings with validation
    return data.map(item => {
      let displaySettings: PresentationDisplaySettings;
      try {
        displaySettings = isPresentationDisplaySettings(item.display_settings) 
          ? item.display_settings as PresentationDisplaySettings
          : defaultDisplaySettings;
      } catch (e) {
        console.warn('Invalid display_settings format, using defaults', e);
        displaySettings = defaultDisplaySettings;
      }

      return {
        ...item,
        display_settings: displaySettings
      };
    }) as SalesPresentation[];
  } catch (error) {
    console.error('Failed to fetch sales presentations:', error);
    return [];
  }
}
