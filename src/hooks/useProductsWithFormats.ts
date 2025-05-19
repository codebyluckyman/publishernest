
import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { FormatLight } from '@/types/format';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';

export interface ProductWithFormat extends Product {
  format: FormatLight;
}

export const useProductsWithFormats = () => {
  const [products, setProducts] = useState<ProductWithFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    if (!currentOrganization) {
      setLoading(false);
      return;
    }

    const fetchProductsWithFormats = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            format:format_id(
              id, format_name, binding_type, cover_material, cover_stock_print, 
              internal_material, internal_stock_print, orientation, extent,
              tps_height_mm, tps_width_mm, tps_depth_mm,
              plc_height_mm, plc_width_mm, plc_depth_mm,
              end_papers_material, end_papers_print, spacers_material, spacers_stock_print
            )
          `)
          .eq('organization_id', currentOrganization.id);

        if (error) throw error;

        // Cast to ProductWithFormat[] since we know the structure matches
        setProducts(data as unknown as ProductWithFormat[]);
      } catch (err) {
        console.error('Error fetching products with formats:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      } finally {
        setLoading(false);
      }
    };

    fetchProductsWithFormats();
  }, [currentOrganization]);

  return { products, loading, error };
};
