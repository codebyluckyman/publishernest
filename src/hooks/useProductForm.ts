
import { useState } from 'react';
import { Product } from '@/types/product';
import { useProducts } from './useProducts';

export function useProductForm() {
  const { createProduct, updateProduct } = useProducts();
  const [isLoading, setIsLoading] = useState(false);

  const submitProduct = async (productData: Partial<Product>, isEditing: boolean = false) => {
    setIsLoading(true);
    try {
      // Ensure format_extras is properly structured
      const formattedData = {
        ...productData,
        format_extras: productData.format_extras || {
          foil: false,
          spot_uv: false,
          glitter: false,
          embossing: false,
          die_cut: false,
          holographic: false
        }
      };

      if (isEditing && productData.id) {
        await updateProduct.mutateAsync({
          id: productData.id,
          updates: formattedData
        });
      } else {
        await createProduct.mutateAsync(formattedData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitProduct,
    isLoading
  };
}
