
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { SalesPresentation } from '@/types/salesPresentation';
import { Organization } from '@/types/organization';

interface FetchSalesPresentationsParams {
  currentOrganization: Organization;
  status?: string;
  limit?: number;
  page?: number;
}

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

    // Map and cast each presentation's display_settings to the correct type
    return data.map(item => ({
      ...item,
      display_settings: item.display_settings as SalesPresentation['display_settings']
    })) as SalesPresentation[];
  } catch (error) {
    console.error('Failed to fetch sales presentations:', error);
    return [];
  }
}
