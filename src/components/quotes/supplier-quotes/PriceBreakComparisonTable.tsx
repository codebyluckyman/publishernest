
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

interface QuoteData {
  quote: SupplierQuote;
  supplier: { id: string; name: string };
  productPrices: ProductPriceCell[]; // Array indexed by product position (0-based)
}

interface QuantityComparisonData {
  quantity: number;
  maxProducts: number;
  quoteData: {
    [quoteId: string]: QuoteData;
  };
}

interface SupplierQuoteGroup {
  supplier: { id: string; name: string };
  quoteIds: string[];
}

// Helper function to get the correct unit cost based on product index
const getUnitCostForProduct = (priceBreak: SupplierQuotePriceBreak, productIndex: number): number | null => {
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

  const { comparisonData, supplierQuoteGroups, globalMaxProducts } = useMemo(() => {
    console.log("🏗️ Building enhanced comparison data...");
    const dataMap = new Map<number, QuantityComparisonData>();
    const suppliers = new Map<string, { id: string; name: string }>();
    let maxProductsGlobal = 1;

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
        
        // Update global max products
        maxProductsGlobal = Math.max(maxProductsGlobal, numProducts);
        
        console.log(`💰 Processing price break for quantity ${quantity}, ${numProducts} products`);

        if (!dataMap.has(quantity)) {
          dataMap.set(quantity, {
            quantity,
            maxProducts: numProducts,
            quoteData: {}
          });
        } else {
          // Update max products if this price break has more
          const existingData = dataMap.get(quantity)!;
          existingData.maxProducts = Math.max(existingData.maxProducts, numProducts);
        }

        const quantityData = dataMap.get(quantity)!;
        
        if (!quantityData.quoteData[quote.id]) {
          quantityData.quoteData[quote.id] = {
            quote,
            supplier: suppliers.get(quote.supplier_id)!,
            productPrices: []
          };
        }

        const quoteData = quantityData.quoteData[quote.id];
        
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
          quoteData.productPrices[productIndex - 1] = productCell;
          
          console.log(`✅ Added product ${productIndex} cell:`, {
            quantity,
            quoteId: quote.id,
            productIndex,
            unitCost,
            isValid
          });
        }
      });
    });

    // Build supplier quote groups for header rendering
    const supplierGroups = new Map<string, SupplierQuoteGroup>();
    
    dataMap.forEach(quantityData => {
      Object.values(quantityData.quoteData).forEach(({ quote, supplier }) => {
        if (!supplierGroups.has(supplier.id)) {
          supplierGroups.set(supplier.id, {
            supplier,
            quoteIds: []
          });
        }
        if (!supplierGroups.get(supplier.id)!.quoteIds.includes(quote.id)) {
          supplierGroups.get(supplier.id)!.quoteIds.push(quote.id);
        }
      });
    });

    const finalData = {
      comparisonData: Array.from(dataMap.values()).sort((a, b) => a.quantity - b.quantity),
      supplierQuoteGroups: Array.from(supplierGroups.values()).sort((a, b) => a.supplier.name.localeCompare(b.supplier.name)),
      globalMaxProducts: maxProductsGlobal
    };

    console.log("🎯 Final enhanced comparison data:", {
      comparisonDataCount: finalData.comparisonData.length,
      quantities: finalData.comparisonData.map(d => `${d.quantity} (max ${d.maxProducts} products)`),
      supplierQuoteGroups: finalData.supplierQuoteGroups.map(g => `${g.supplier.name} (${g.quoteIds.length} quotes)`),
      globalMaxProducts: finalData.globalMaxProducts
    });

    return finalData;
  }, [filteredQuotes]);

  const getBestPriceForProduct = (quantity: number, productIndex: number) => {
    const quantityData = comparisonData.find(d => d.quantity === quantity);
    if (!quantityData) return null;

    const prices: number[] = [];
    Object.values(quantityData.quoteData).forEach(quoteData => {
      const productCell = quoteData.productPrices[productIndex - 1]; // Convert to 0-based
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
            {/* Product header row */}
            <tr>
              <th className="border border-gray-300 p-3 bg-gray-50 font-semibold text-left" rowSpan={3}>
                Quantity
              </th>
              {Array.from({ length: globalMaxProducts }, (_, productIndex) => {
                const totalQuotesForProduct = supplierQuoteGroups.reduce((total, group) => total + group.quoteIds.length, 0);
                return (
                  <th
                    key={`product-${productIndex + 1}`}
                    className="border border-gray-300 p-3 bg-gray-50 font-semibold text-center"
                    colSpan={totalQuotesForProduct}
                  >
                    Product {productIndex + 1}
                  </th>
                );
              })}
            </tr>
            
            {/* Supplier names row - under each product */}
            <tr>
              {Array.from({ length: globalMaxProducts }, (_, productIndex) => (
                supplierQuoteGroups.map(group => (
                  <th
                    key={`${productIndex + 1}-supplier-${group.supplier.id}`}
                    className="border border-gray-300 p-2 bg-gray-100 text-sm font-medium text-center"
                    colSpan={group.quoteIds.length}
                  >
                    {group.supplier.name}
                  </th>
                ))
              )).flat()}
            </tr>

            {/* Quote reference row - under each supplier */}
            <tr>
              {Array.from({ length: globalMaxProducts }, (_, productIndex) => (
                supplierQuoteGroups.map(group => 
                  group.quoteIds.map(quoteId => {
                    const quote = filteredQuotes.find(q => q.id === quoteId);
                    const quoteReference = quote?.reference || quote?.reference_id || quoteId.slice(0, 8);
                    return (
                      <th
                        key={`${productIndex + 1}-quote-${quoteId}`}
                        className="border border-gray-300 p-1 bg-gray-50 text-xs font-medium text-center"
                      >
                        {quoteReference}
                      </th>
                    );
                  })
                )
              )).flat()}
            </tr>
          </thead>
          
          <tbody>
            {comparisonData.map(quantityData => (
              <tr key={quantityData.quantity}>
                <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                  {quantityData.quantity.toLocaleString()}
                </td>
                
                {/* Product columns - iterate by product first, then suppliers, then quotes */}
                {Array.from({ length: globalMaxProducts }, (_, productIndex) => (
                  supplierQuoteGroups.map(group =>
                    group.quoteIds.map(quoteId => {
                      const quoteData = quantityData.quoteData[quoteId];
                      const productCell = quoteData?.productPrices[productIndex];
                      
                      if (!productCell) {
                        return (
                          <td
                            key={`${productIndex + 1}-${quoteId}`}
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
                          key={`${productIndex + 1}-${quoteId}`}
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
                  )
                )).flat().flat()}
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
