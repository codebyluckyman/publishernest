
import { useQuery } from '@tanstack/react-query';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { useOrganization } from './useOrganization';
import { Product } from '@/types/product';

export function useProducts() {
  const { currentOrganization } = useOrganization();
  
  const query = useQuery({
    queryKey: ['products', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      
      const { data, error } = await supabaseCustom
        .from('products')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('title');
        
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!currentOrganization,
  });
  
  return {
    products: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
