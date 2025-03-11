
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QuoteRequest } from "@/types/quoteRequest";

interface ProductLine {
  id: string;
  product_title: string;
  quantity: number;
  notes: string | null;
}

export function useProductLines(quoteRequest: QuoteRequest | null) {
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchProductLines = async () => {
      if (!quoteRequest?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('quote_request_products')
          .select(`
            id, 
            quantity, 
            notes,
            products:product_id (title)
          `)
          .eq('quote_request_id', quoteRequest.id);
          
        if (error) throw error;
        
        if (data) {
          const formattedData = data.map(item => ({
            id: item.id,
            product_title: item.products?.title || 'Unknown Product',
            quantity: item.quantity,
            notes: item.notes
          }));
          
          setProductLines(formattedData);
        }
      } catch (error) {
        console.error('Error fetching product lines:', error);
        toast.error('Failed to load product information');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (quoteRequest) {
      fetchProductLines();
    }
  }, [quoteRequest]);

  return { productLines, isLoading };
}
