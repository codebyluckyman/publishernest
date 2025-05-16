
import { useQuery } from '@tanstack/react-query';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { useOrganization } from './useOrganization';
import { Product } from '@/types/product';
import { Format } from '@/types/format';

// Define a complete format interface for the component needs
interface FormatLight {
  id: string;
  format_name: string | null;
  tps_height_mm: number | null;
  tps_width_mm: number | null;
  tps_depth_mm: number | null;
  tps_plc_height_mm: number | null;
  tps_plc_width_mm: number | null;
  tps_plc_depth_mm: number | null;
  extent: string | null;
  binding_type: string | null;
  cover_material: string | null;
  internal_material: string | null;
  cover_stock_print: string | null;
  internal_stock_print: string | null;
  orientation: string | null;
}

export interface ProductWithFormat extends Product {
  format?: FormatLight | null;
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
          format:format_id (
            id,
            format_name,
            tps_height_mm,
            tps_width_mm,
            tps_depth_mm,
            tps_plc_height_mm,
            tps_plc_width_mm,
            tps_plc_depth_mm,
            extent,
            binding_type,
            cover_material,
            internal_material,
            cover_stock_print,
            internal_stock_print,
            orientation
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
      }));
      
      return productsWithDefaults as unknown as ProductWithFormat[];
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
