
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { ProductLine } from "./types";

export function useProductLines(quoteRequestId?: string) {
  const { setValue } = useFormContext();
  const [productLines, setProductLines] = useState<ProductLine[]>([]);

  // Fetch existing product lines for this quote request
  useEffect(() => {
    const fetchProductLines = async () => {
      if (!quoteRequestId) {
        setProductLines([]);
        setValue('product_lines', []);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('quote_request_products')
          .select(`
            id, 
            product_id, 
            quantity, 
            notes,
            products:product_id (title)
          `)
          .eq('quote_request_id', quoteRequestId);
          
        if (error) throw error;
        
        if (data) {
          const formattedData = data.map(item => ({
            id: item.id,
            product_id: item.product_id,
            product_title: item.products?.title || 'Unknown Product',
            quantity: item.quantity,
            notes: item.notes || ''
          }));
          
          setProductLines(formattedData);
          setValue('product_lines', formattedData);
        }
      } catch (error) {
        console.error('Error fetching product lines:', error);
        toast.error('Failed to load product lines');
      }
    };
    
    fetchProductLines();
  }, [quoteRequestId, setValue]);

  const addProductLine = (newLine: ProductLine) => {
    const updatedLines = [...productLines, newLine];
    setProductLines(updatedLines);
    setValue('product_lines', updatedLines);
  };

  const removeProductLine = (index: number) => {
    const updatedLines = [...productLines];
    updatedLines.splice(index, 1);
    setProductLines(updatedLines);
    setValue('product_lines', updatedLines);
  };

  return {
    productLines,
    addProductLine,
    removeProductLine
  };
}
