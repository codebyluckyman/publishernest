import { Product } from "@/types/product";
import { ProductWithFormat, FormatLight } from "@/hooks/useProductsWithFormats";

/**
 * Adapts a regular Product to ProductWithFormat by ensuring the format has all required properties
 * @param product The product to adapt
 * @returns A ProductWithFormat with all required format properties
 */
export function adaptProductToProductWithFormat(product: Product): ProductWithFormat {
  if (!product.format) {
    return product as ProductWithFormat;
  }
  
  // Create a complete FormatLight object with all required properties
  const completeFormat: FormatLight = {
    id: product.format.id,
    format_name: product.format.format_name,
    tps_height_mm: product.format.tps_height_mm,
    tps_width_mm: product.format.tps_width_mm,
    tps_depth_mm: product.format.tps_depth_mm,
    tps_plc_height_mm: product.format.tps_plc_height_mm,
    tps_plc_width_mm: product.format.tps_plc_width_mm,
    tps_plc_depth_mm: product.format.tps_plc_depth_mm,
    extent: product.format.extent,
    binding_type: product.format.binding_type,
    cover_material: product.format.cover_material,
    internal_material: product.format.internal_material,
    cover_stock_print: product.format.cover_stock_print,
    internal_stock_print: product.format.internal_stock_print,
    orientation: product.format.orientation,
    
    // These properties may not exist on all format objects, so we need to use null as fallbacks
    end_papers_material: null,
    end_papers_print: null,
    spacers_material: null,
    spacers_stock_print: null,
  };

  // Return the product with the complete format
  return {
    ...product,
    format: completeFormat,
  } as ProductWithFormat;
}

/**
 * Adapts an array of products to ProductWithFormat
 * @param products Array of products or product objects to adapt
 * @returns Array of ProductWithFormat objects
 */
export function adaptProductsToProductWithFormat(
  products: (Product | { product: Product; customPrice?: number; customDescription?: string })[]
): { product: ProductWithFormat; customPrice?: number; customDescription?: string; }[] {
  return products.map(item => {
    if ('product' in item) {
      // If the item has a product property, it's already in the right format
      return {
        product: adaptProductToProductWithFormat(item.product),
        customPrice: item.customPrice,
        customDescription: item.customDescription,
      };
    } else {
      // Otherwise, wrap the product
      return {
        product: adaptProductToProductWithFormat(item as Product),
      };
    }
  });
}
