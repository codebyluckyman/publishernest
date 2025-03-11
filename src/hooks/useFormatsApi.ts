
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/types/organization';

export interface Format {
  id: string;
  format_name: string;
  organization_id: string;
}

export const useFormatsApi = (currentOrganization: Organization | null) => {
  const fetchFormats = async () => {
    if (!currentOrganization) return [];

    try {
      const { data, error } = await supabase
        .from('formats')
        .select('id, format_name, organization_id')
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;
      return data as Format[];
    } catch (error) {
      console.error('Error fetching formats:', error);
      return [];
    }
  };

  const fetchQuoteRequestFormats = async (quoteRequestId: string) => {
    try {
      const { data, error } = await supabase
        .from('quote_request_formats')
        .select('format_id')
        .eq('quote_request_id', quoteRequestId);

      if (error) throw error;
      return data.map(item => item.format_id);
    } catch (error) {
      console.error('Error fetching quote request formats:', error);
      return [];
    }
  };

  const { data: formats = [], isLoading: isLoadingFormats } = useQuery({
    queryKey: ['formats', currentOrganization?.id],
    queryFn: fetchFormats,
    enabled: !!currentOrganization,
  });

  return {
    formats,
    isLoadingFormats,
    fetchQuoteRequestFormats
  };
};
