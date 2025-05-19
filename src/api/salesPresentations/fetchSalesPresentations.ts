
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { SalesPresentation, PresentationDisplaySettings, CardColumn, DialogColumn, PresentationViewMode } from '@/types/salesPresentation';
import { Organization } from '@/types/organization';

interface FetchSalesPresentationsParams {
  currentOrganization: Organization;
  status?: string;
  createdBy?: string;
  limit?: number;
  page?: number;
}

// Type guard to verify the shape of legacy display_settings
function hasDisplayColumns(obj: any): obj is { displayColumns: CardColumn[] } {
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
  dialogColumns: ["price", "isbn13", "publisher", "publication_date", "synopsis"],
  defaultView: 'card'
};

export async function fetchSalesPresentations({
  currentOrganization,
  status,
  createdBy,
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

    if (createdBy) {
      query = query.eq('created_by', createdBy);
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

    // Map and convert each presentation's display_settings to the updated format
    return data.map(item => {
      let displaySettings: PresentationDisplaySettings;
      
      try {
        if (item.display_settings) {
          const settings = item.display_settings;
          
          // Check if it's already in the new format
          if (hasCardAndDialogColumns(settings)) {
            displaySettings = {
              cardColumns: settings.cardColumns as CardColumn[],
              dialogColumns: settings.dialogColumns as DialogColumn[],
              defaultView: settings.defaultView as PresentationViewMode || 'card'
            };
          }
          // Check if it's in the legacy format and convert
          else if (hasDisplayColumns(settings)) {
            displaySettings = {
              cardColumns: settings.displayColumns as CardColumn[],
              dialogColumns: [...settings.displayColumns, 'synopsis'] as DialogColumn[],
              defaultView: 'card'
            };
          } else {
            displaySettings = defaultDisplaySettings;
          }
        } else {
          displaySettings = defaultDisplaySettings;
        }
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
