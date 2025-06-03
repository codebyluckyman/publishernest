
import React, { useMemo, useState } from "react";
import { SupplierQuote, SupplierQuotePriceBreak } from "@/types/supplierQuote";
import { formatCurrency } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SupplierQuoteDetailsSheet } from "./details/SupplierQuoteDetailsSheet";

interface PriceBreakComparisonTableProps {
  quotes: SupplierQuote[];
  includeExpiredQuotes: boolean;
  includeDraftQuotes: boolean;
  onSelectQuote?: (quote: SupplierQuote) => void;
}

interface ProductPriceCell {
  unitCost: number | null;
  quote: SupplierQuote;
  priceBreak: SupplierQuotePriceBreak;
  isExpired: boolean;
  isDraft: boolean;
  isValid: boolean;
  productIndex: number; // 1-based index (1, 2, 3, etc.)
}

interface QuantityComparisonData {
  quantity: number;
  maxProducts: number;
  supplierData: {
    [supplierId: string]: {
      supplier: { id: string; name: string };
      productPrices: ProductPriceCell[]; // Array indexed by product position (0-based)
    };
  };
}

// Helper function to get the correct unit cost based on product index
const getUnitCostForProduct = (priceBreak: SupplierQuotePriceBreak, productIndex: number): number | null => {
  if (productIndex === 1) return priceBreak.unit_cost || null;
  
  const columnName = `unit_cost_${productIndex}` as keyof SupplierQuotePriceBreak;
  const unitCost = priceBreak[columnName] as number | null;
  
  console.log(`🔍 Getting unit cost for product ${productIndex}:`, {
    priceBreakId: priceBreak.id,
    columnName,
    unitCost,
    fallbackUnitCost: priceBreak.unit_cost,
  });
  
  return unitCost || null;
};

export function PriceBreakComparisonTable({
  quotes,
  includeExpiredQuotes,
  includeDraftQuotes,
  onSelectQuote
}: PriceBreakComparisonTableProps) {
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);

  console.log("🎯 PriceBreakComparisonTable render:", {
    totalQuotes: quotes.length,
    includeExpiredQuotes,
    includeDraftQuotes,
  });

  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      if (!includeExpiredQuotes) {
        const isExpired = quote.valid_to ? new Date(quote.valid_to) < new Date() : false;
        if (isExpired) return false;
      }
      
      if (!includeDraftQuotes && quote.status === 'draft') {
        return false;
      }
      
      return true;
    });
  }, [quotes, includeExpiredQuotes, includeDraftQuotes]);

  const { comparisonData, uniqueSuppliers } = useMemo(() => {
    console.log("🏗️ Building enhanced comparison data...");
    const dataMap = new Map<number, QuantityComparisonData>();
    const suppliers = new Map<string, { id: string; name: string }>();

    filteredQuotes.forEach(quote => {
      console.log(`🔍 Processing quote ${quote.id}:`, {
        supplierId: quote.supplier_id,
        supplierName: quote.supplier?.supplier_name,
        priceBreaksCount: quote.price_breaks?.length || 0,
      });

      if (!quote.price_breaks || quote.price_breaks.length === 0) {
        console.log(`⚠️ Quote ${quote.id} has no price breaks, skipping`);
        return;
      }
      
      const isExpired = quote.valid_to ? new Date(quote.valid_to) < new Date() : false;
      const isDraft = quote.status === 'draft';
      const isValid = quote.status === 'submitted' && !isExpired;
      
      suppliers.set(quote.supplier_id, {
        id: quote.supplier_id,
        name: quote.supplier?.supplier_name || "Unknown Supplier"
      });

      quote.price_breaks.forEach((priceBreak) => {
        const quantity = priceBreak.quantity;
        const numProducts = priceBreak.num_products || 1;
        
        console.log(`💰 Processing price break for quantity ${quantity}, ${numProducts} products`);

        if (!dataMap.has(quantity)) {
          dataMap.set(quantity, {
            quantity,
            maxProducts: numProducts,
            supplierData: {}
          });
        } else {
          // Update max products if this price break has more
          const existingData = dataMap.get(quantity)!;
          existingData.maxProducts = Math.max(existingData.maxProducts, numProducts);
        }

        const quantityData = dataMap.get(quantity)!;
        
        if (!quantityData.supplierData[quote.supplier_id]) {
          quantityData.supplierData[quote.supplier_id] = {
            supplier: suppliers.get(quote.supplier_id)!,
            productPrices: []
          };
        }

        const supplierData = quantityData.supplierData[quote.supplier_id];
        
        // Create individual product price cells for each product (1 to numProducts)
        for (let productIndex = 1; productIndex <= numProducts; productIndex++) {
          const unitCost = getUnitCostForProduct(priceBreak, productIndex);
          
          const productCell: ProductPriceCell = {
            unitCost,
            quote,
            priceBreak,
            isExpired,
            isDraft,
            isValid,
            productIndex
          };
          
          // Store in 0-based array (productIndex - 1)
          supplierData.productPrices[productIndex - 1] = productCell;
          
          console.log(`✅ Added product ${productIndex} cell:`, {
            quantity,
            supplierId: quote.supplier_id,
            productIndex,
            unitCost,
            isValid
          });
        }
      });
    });

    const finalData = {
      comparisonData: Array.from(dataMap.values()).sort((a, b) => a.quantity - b.quantity),
      uniqueSuppliers: Array.from(suppliers.values()).sort((a, b) => a.name.localeCompare(b.name))
    };

    console.log("🎯 Final enhanced comparison data:", {
      comparisonDataCount: finalData.comparisonData.length,
      quantities: finalData.comparisonData.map(d => `${d.quantity} (max ${d.maxProducts} products)`),
      uniqueSuppliers: finalData.uniqueSuppliers.map(s => s.name),
    });

    return finalData;
  }, [filteredQuotes]);

  const getBestPriceForProduct = (quantity: number, productIndex: number) => {
    const quantityData = comparisonData.find(d => d.quantity === quantity);
    if (!quantityData) return null;

    const prices: number[] = [];
    Object.values(quantityData.supplierData).forEach(supplierData => {
      const productCell = supplierData.productPrices[productIndex - 1]; // Convert to 0-based
      if (productCell?.isValid && productCell.unitCost !== null) {
        prices.push(productCell.unitCost);
      }
    });
    
    console.log(`🏆 Finding best price for quantity ${quantity}, product ${productIndex}:`, {
      validPrices: prices
    });
    
    if (prices.length === 0) return null;
    
    const bestPrice = Math.min(...prices);
    console.log(`🎯 Best price found: ${bestPrice}`);
    return bestPrice;
  };

  const handleCellClick = (cell: ProductPriceCell) => {
    console.log("🖱️ Product cell clicked:", {
      quoteId: cell.quote.id,
      supplierId: cell.quote.supplier_id,
      productIndex: cell.productIndex,
      unitCost: cell.unitCost,
    });
    setSelectedQuote(cell.quote);
    setDetailsSheetOpen(true);
  };

  const handleApproveQuote = (quote: SupplierQuote) => {
    console.log("✅ Approving quote:", quote.id);
    if (onSelectQuote) {
      onSelectQuote(quote);
      setDetailsSheetOpen(false);
    }
  };

  if (comparisonData.length === 0) {
    console.log("❌ No comparison data available");
    return (
      <div className="text-center p-8 border border-dashed rounded-md">
        <p className="text-muted-foreground">No price break data available for comparison.</p>
      </div>
    );
  }

  console.log("🎨 Rendering enhanced price break comparison table");

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            {/* Main header row - Quantity and Product Groups */}
            <tr>
              <th className="border border-gray-300 p-3 bg-gray-50 font-semibold text-left" rowSpan={3}>
                Quantity
              </th>
              {comparisonData.map(quantityData => (
                <th
                  key={`products-${quantityData.quantity}`}
                  className="border border-gray-300 p-3 bg-gray-50 font-semibold text-center"
                  colSpan={quantityData.maxProducts * uniqueSuppliers.length}
                >
                  {quantityData.maxProducts} Product{quantityData.maxProducts !== 1 ? 's' : ''}
                </th>
              ))}
            </tr>
            
            {/* Supplier names row - repeated for each product */}
            <tr>
              {comparisonData.map(quantityData => (
                Array.from({ length: quantityData.maxProducts }, (_, productIndex) => (
                  uniqueSuppliers.map(supplier => (
                    <th
                      key={`${quantityData.quantity}-${productIndex}-${supplier.id}`}
                      className="border border-gray-300 p-2 bg-gray-100 text-sm font-medium text-center"
                    >
                      {supplier.name}
                    </th>
                  ))
                )).flat()
              ))}
            </tr>
            
            {/* Product labels row */}
            <tr>
              {comparisonData.map(quantityData => (
                Array.from({ length: quantityData.maxProducts }, (_, productIndex) => (
                  uniqueSuppliers.map(supplier => (
                    <th
                      key={`product-${quantityData.quantity}-${productIndex}-${supplier.id}`}
                      className="border border-gray-300 p-1 bg-gray-50 text-xs text-center"
                    >
                      Product {productIndex + 1}
                    </th>
                  ))
                )).flat()
              ))}
            </tr>
          </thead>
          
          <tbody>
            {comparisonData.map(quantityData => (
              <tr key={quantityData.quantity}>
                <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                  {quantityData.quantity.toLocaleString()}
                </td>
                
                {/* Product columns for this quantity */}
                {Array.from({ length: quantityData.maxProducts }, (_, productIndex) => (
                  uniqueSuppliers.map(supplier => {
                    const supplierData = quantityData.supplierData[supplier.id];
                    const productCell = supplierData?.productPrices[productIndex];
                    
                    if (!productCell) {
                      return (
                        <td
                          key={`${productIndex}-${supplier.id}`}
                          className="border border-gray-300 p-3 text-center text-gray-400"
                        >
                          N/A
                        </td>
                      );
                    }
                    
                    const bestPrice = getBestPriceForProduct(quantityData.quantity, productIndex + 1);
                    const isBest = productCell.isValid && 
                                  productCell.unitCost === bestPrice && 
                                  bestPrice !== null;
                    const currency = productCell.quote.currency || 'USD';
                    
                    return (
                      <td
                        key={`${productIndex}-${supplier.id}`}
                        className="border border-gray-300 p-2 text-center"
                      >
                        <div className="space-y-1">
                          {/* Status badge */}
                          <div className="text-xs">
                            {productCell.isDraft ? (
                              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                Draft
                              </Badge>
                            ) : productCell.isExpired ? (
                              <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                                Expired
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                                Valid
                              </Badge>
                            )}
                          </div>
                          
                          {/* Price */}
                          <div>
                            {productCell.unitCost !== null ? (
                              <button
                                onClick={() => handleCellClick(productCell)}
                                className={cn(
                                  "text-sm font-medium hover:underline cursor-pointer",
                                  productCell.isExpired && "line-through text-gray-400",
                                  productCell.isDraft && "text-gray-500"
                                )}
                              >
                                {formatCurrency(productCell.unitCost, currency)}
                                {isBest && (
                                  <span className="ml-1 text-xs font-bold text-green-600">
                                    BEST
                                  </span>
                                )}
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">No price</span>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })
                )).flat()}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SupplierQuoteDetailsSheet
        quote={selectedQuote}
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        onApprove={onSelectQuote ? handleApproveQuote : undefined}
      />
    </>
  );
}
