
import { SupplierQuote, SupplierQuotePriceBreak } from '@/types/supplierQuote';
import { Product } from '@/types/product';

/**
 * Calculate the unit cost for a product based on the supplier quote and quantity
 */
export function calculateUnitCost({
  productId,
  formatId,
  quantity,
  supplierQuoteId,
  supplierQuotes
}: {
  productId: string;
  formatId?: string;
  quantity: number;
  supplierQuoteId?: string;
  supplierQuotes: SupplierQuote[];
}): {
  unitCost: number;
  supplierQuoteId?: string;
  supplierId?: string;
} {
  if (!productId || quantity <= 0) {
    return { unitCost: 0 };
  }

  // Find the relevant supplier quote (either by ID or best match)
  let supplierQuote: SupplierQuote | undefined;
  
  if (supplierQuoteId) {
    supplierQuote = supplierQuotes.find(quote => quote.id === supplierQuoteId);
  } else if (supplierQuotes.length > 0) {
    // Find best quote with lowest unit cost
    let bestUnitCost = Number.MAX_VALUE;
    
    supplierQuotes.forEach(quote => {
      const priceBreak = findBestPriceBreak(quote, productId, quantity);
      if (priceBreak && priceBreak.unit_cost && priceBreak.unit_cost < bestUnitCost) {
        bestUnitCost = priceBreak.unit_cost;
        supplierQuote = quote;
      }
    });
  }

  if (!supplierQuote) {
    return { unitCost: 0 };
  }

  const priceBreak = findBestPriceBreak(supplierQuote, productId, quantity);
  if (!priceBreak || !priceBreak.unit_cost) {
    return { unitCost: 0 };
  }

  return {
    unitCost: priceBreak.unit_cost,
    supplierQuoteId: supplierQuote.id,
    supplierId: supplierQuote.supplier_id
  };
}

/**
 * Find the best price break for a given product, quantity, and supplier quote
 */
function findBestPriceBreak(
  supplierQuote: SupplierQuote,
  productId: string,
  quantity: number
): SupplierQuotePriceBreak | undefined {
  if (!supplierQuote.price_breaks || supplierQuote.price_breaks.length === 0) {
    return undefined;
  }

  // Filter price breaks for this product
  const productPriceBreaks = supplierQuote.price_breaks.filter(
    pb => pb.product_id === productId
  );

  if (productPriceBreaks.length === 0) {
    return undefined;
  }

  // Find the best price break for this quantity
  // (highest quantity less than or equal to the requested quantity)
  return productPriceBreaks
    .filter(pb => pb.quantity <= quantity)
    .sort((a, b) => b.quantity - a.quantity)[0];
}

/**
 * Calculate the total cost for a given quantity and unit cost
 */
export function calculateTotalCost(quantity: number, unitCost: number): number {
  return parseFloat((quantity * unitCost).toFixed(2));
}
