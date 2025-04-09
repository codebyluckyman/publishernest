
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';

export function useFormats() {
  const { currentOrganization } = useOrganization();

  const formatsQuery = useQuery({
    queryKey: ['formats', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      
      const { data, error } = await supabase
        .from('formats')
        .select('*')
        .eq('organization_id', currentOrganization.id);
        
      if (error) {
        throw new Error(`Error fetching formats: ${error.message}`);
      }
      
      return data;
    },
    enabled: !!currentOrganization,
  });
  
  return {
    formats: formatsQuery.data || [],
    isLoadingFormats: formatsQuery.isLoading,
    isErrorFormats: formatsQuery.isError,
    errorFormats: formatsQuery.error,
  };
}
