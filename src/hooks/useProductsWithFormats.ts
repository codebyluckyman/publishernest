
import { useQuery } from '@tanstack/react-query';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { useOrganization } from './useOrganization';
import { Product } from '@/types/product';
import { Format } from '@/types/format';

export interface ProductWithFormat extends Product {
  default_price: number | null;
  default_currency: string;
}

export function useProductsWithFormats() {
  const { currentOrganization } = useOrganization();
  
  const query = useQuery({
    queryKey: ['products-with-formats', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      
      const { data, error } = await supabaseCustom
        .from('products')
        .select(`
          *,
          format:format_id ( *
          )
        `)
        .eq('organization_id', currentOrganization.id)
        .order('title');
        
      if (error) throw error;
      
      // Add missing default_price and default_currency properties to make it compatible with ProductWithFormat type
      const productsWithDefaults = data.map(product => ({
        ...product,
        default_price: product.list_price,
        default_currency: product.currency_code || 'USD',
        format_extras: typeof product.format_extras === 'object' ? product.format_extras : null,
      }));

      
      return productsWithDefaults as ProductWithFormat[];
    },
    enabled: !!currentOrganization,
  });

  return {
    products: query.data || [] as ProductWithFormat[],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}


