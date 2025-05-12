
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { Product } from '@/types/product';

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
      .select('*')
      .eq('organization_id', organizationId)
      .in('isbn13', cleanIsbnList);
    
    if (error) {
      console.error('Error fetching products by ISBN:', error);
      return [];
    }
    
    return data as Product[];
  } catch (error) {
    console.error('Failed to fetch products by ISBN:', error);
    return [];
  }
}
