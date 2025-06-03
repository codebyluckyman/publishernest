
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { Product, FormatExtra } from '@/types/product';

/**
 * Fetches products by an array of ISBN-13 values
 */
export async function fetchProductsByISBN(
  isbnList: string[], 
  organizationId: string
): Promise<Product[]> {
  if (!isbnList.length || !organizationId) {
    return [];
  }

  // Clean up ISBN values (remove spaces, dashes, etc)
  const cleanIsbnList = isbnList.map(isbn => 
    isbn.trim().replace(/[-\s]/g, '')
  ).filter(isbn => isbn.length > 0);

  try {
    const { data, error } = await supabaseCustom
      .from('products')
      .select(`
        *,
        format:format_id (*)
      `)
      .eq('organization_id', organizationId)
      .in('isbn13', cleanIsbnList);

    if (error) {
      console.error('Error fetching products by ISBN:', error);
      return [];
    }
    
    // Map the database results to the Product type, correctly handling format_extras
    return (data || []).map(item => {
      // Parse and convert format_extras to the expected type
      let formatExtras: { foil: boolean; spot_uv: boolean; glitter: boolean; embossing: boolean; die_cut: boolean; holographic: boolean; } | FormatExtra[] = {
        foil: false,
        spot_uv: false,
        glitter: false,
        embossing: false,
        die_cut: false,
        holographic: false
      };
      
      // Check if format_extras exists and try to parse it correctly
      if (item.format_extras) {
        try {
          const extras = typeof item.format_extras === 'string' 
            ? JSON.parse(item.format_extras) 
            : item.format_extras;
          
          // Check if it's the boolean object format or array format
          if (Array.isArray(extras)) {
            formatExtras = extras.map((extra: any) => ({
              name: extra.name || '',
              description: extra.description,
              unit_of_measure_id: extra.unit_of_measure_id
            })) as FormatExtra[];
          } else if (typeof extras === 'object') {
            formatExtras = extras as any;
          }
        } catch (e) {
          console.warn('Failed to parse format_extras:', e);
        }
      }

      // Return properly typed Product object
      return {
        ...item,
        default_price: item.list_price || 0,
        default_currency: item.currency_code || 'USD',
        format_extras: formatExtras
      } as unknown as Product;
    });
  } catch (error) {
    console.error('Failed to fetch products by ISBN:', error);
    return [];
  }
}
