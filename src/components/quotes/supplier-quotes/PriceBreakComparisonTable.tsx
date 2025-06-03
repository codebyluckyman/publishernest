
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

interface PriceBreakCell {
  unitCost: number | null;
  quote: SupplierQuote;
  priceBreak: SupplierQuotePriceBreak;
  isExpired: boolean;
  isDraft: boolean;
  isValid: boolean;
}

interface PriceBreakComparisonData {
  quantity: number;
  productCombinations: {
    [numProducts: number]: {
      [supplierId: string]: PriceBreakCell;
    };
  };
}

// Helper function to get the correct unit cost based on number of products
const getUnitCostForProducts = (priceBreak: SupplierQuotePriceBreak, numProducts: number): number | null => {
  const columnName = `unit_cost_${numProducts}` as keyof SupplierQuotePriceBreak;
  const unitCost = priceBreak[columnName] as number | null;
  
  console.log(`🔍 Getting unit cost for ${numProducts} products:`, {
    priceBreakId: priceBreak.id,
    columnName,
    unitCost,
    fallbackUnitCost: priceBreak.unit_cost,
    allUnitCosts: {
      unit_cost: priceBreak.unit_cost,
      unit_cost_1: priceBreak.unit_cost_1,
      unit_cost_2: priceBreak.unit_cost_2,
      unit_cost_3: priceBreak.unit_cost_3,
      unit_cost_4: priceBreak.unit_cost_4,
      unit_cost_5: priceBreak.unit_cost_5,
    }
  });
  
  // Fallback to unit_cost if the specific column is null/undefined
  if (unitCost === null || unitCost === undefined) {
    console.log(`⚠️ No unit cost for ${numProducts} products, falling back to base unit_cost:`, priceBreak.unit_cost);
    return priceBreak.unit_cost || null;
  }
  
  return unitCost;
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
    quotesWithPriceBreaks: quotes.filter(q => q.price_breaks && q.price_breaks.length > 0).length,
    quotesDebug: quotes.map(q => ({
      id: q.id,
      supplierId: q.supplier_id,
      priceBreaksCount: q.price_breaks?.length || 0,
      hasPriceBreaks: !!q.price_breaks && q.price_breaks.length > 0
    }))
  });

  const filteredQuotes = useMemo(() => {
    console.log("🔄 Filtering quotes...");
    const filtered = quotes.filter(quote => {
      console.log(`📋 Checking quote ${quote.id}:`, {
        supplierId: quote.supplier_id,
        supplierName: quote.supplier?.supplier_name,
        status: quote.status,
        validTo: quote.valid_to,
        priceBreaksCount: quote.price_breaks?.length || 0,
        priceBreaksData: quote.price_breaks
      });

      if (!includeExpiredQuotes) {
        const isExpired = quote.valid_to ? new Date(quote.valid_to) < new Date() : false;
        if (isExpired) {
          console.log(`❌ Excluding expired quote ${quote.id}`);
          return false;
        }
      }
      
      if (!includeDraftQuotes && quote.status === 'draft') {
        console.log(`❌ Excluding draft quote ${quote.id}`);
        return false;
      }
      
      console.log(`✅ Including quote ${quote.id}`);
      return true;
    });

    console.log("🎯 Filtered quotes result:", {
      originalCount: quotes.length,
      filteredCount: filtered.length,
      filteredQuoteIds: filtered.map(q => q.id)
    });

    return filtered;
  }, [quotes, includeExpiredQuotes, includeDraftQuotes]);

  const { comparisonData, uniqueProductCounts, uniqueSuppliers } = useMemo(() => {
    console.log("🏗️ Building comparison data...");
    const dataMap = new Map<number, PriceBreakComparisonData>();
    const productCounts = new Set<number>();
    const suppliers = new Map<string, { id: string; name: string }>();

    filteredQuotes.forEach(quote => {
      console.log(`🔍 Processing quote ${quote.id}:`, {
        supplierId: quote.supplier_id,
        supplierName: quote.supplier?.supplier_name,
        priceBreaksCount: quote.price_breaks?.length || 0,
        priceBreaks: quote.price_breaks
      });

      if (!quote.price_breaks || quote.price_breaks.length === 0) {
        console.log(`⚠️ Quote ${quote.id} has no price breaks, skipping`);
        return;
      }
      
      const isExpired = quote.valid_to ? new Date(quote.valid_to) < new Date() : false;
      const isDraft = quote.status === 'draft';
      const isValid = quote.status === 'submitted' && !isExpired;
      
      console.log(`📊 Quote ${quote.id} validity:`, {
        isExpired,
        isDraft,
        isValid,
        status: quote.status,
        validTo: quote.valid_to
      });
      
      suppliers.set(quote.supplier_id, {
        id: quote.supplier_id,
        name: quote.supplier?.supplier_name || "Unknown Supplier"
      });

      quote.price_breaks.forEach((priceBreak, index) => {
        console.log(`💰 Processing price break ${index + 1} for quote ${quote.id}:`, {
          priceBreakId: priceBreak.id,
          quantity: priceBreak.quantity,
          numProducts: priceBreak.num_products,
          unitCost: priceBreak.unit_cost,
          allUnitCosts: {
            unit_cost_1: priceBreak.unit_cost_1,
            unit_cost_2: priceBreak.unit_cost_2,
            unit_cost_3: priceBreak.unit_cost_3,
          }
        });

        const quantity = priceBreak.quantity;
        const numProducts = priceBreak.num_products || 1;
        
        console.log(`📈 Adding to data map: quantity=${quantity}, numProducts=${numProducts}`);
        
        productCounts.add(numProducts);

        if (!dataMap.has(quantity)) {
          dataMap.set(quantity, {
            quantity,
            productCombinations: {}
          });
          console.log(`🆕 Created new quantity entry: ${quantity}`);
        }

        const quantityData = dataMap.get(quantity)!;
        
        if (!quantityData.productCombinations[numProducts]) {
          quantityData.productCombinations[numProducts] = {};
          console.log(`🆕 Created new product combination: ${numProducts} products for quantity ${quantity}`);
        }

        // Use the helper function to get the correct unit cost
        const unitCost = getUnitCostForProducts(priceBreak, numProducts);

        quantityData.productCombinations[numProducts][quote.supplier_id] = {
          unitCost,
          quote,
          priceBreak,
          isExpired,
          isDraft,
          isValid
        };

        console.log(`✅ Added price break cell:`, {
          quantity,
          numProducts,
          supplierId: quote.supplier_id,
          unitCost,
          isValid
        });
      });
    });

    const finalData = {
      comparisonData: Array.from(dataMap.values()).sort((a, b) => a.quantity - b.quantity),
      uniqueProductCounts: Array.from(productCounts).sort((a, b) => a - b),
      uniqueSuppliers: Array.from(suppliers.values()).sort((a, b) => a.name.localeCompare(b.name))
    };

    console.log("🎯 Final comparison data:", {
      comparisonDataCount: finalData.comparisonData.length,
      quantities: finalData.comparisonData.map(d => d.quantity),
      uniqueProductCounts: finalData.uniqueProductCounts,
      uniqueSuppliers: finalData.uniqueSuppliers.map(s => s.name),
      dataMap: Object.fromEntries(dataMap)
    });

    return finalData;
  }, [filteredQuotes]);

  const getBestPriceForQuantityAndProducts = (quantity: number, numProducts: number) => {
    const quantityData = comparisonData.find(d => d.quantity === quantity);
    if (!quantityData?.productCombinations[numProducts]) {
      console.log(`❌ No data found for quantity ${quantity}, ${numProducts} products`);
      return null;
    }

    const cells = Object.values(quantityData.productCombinations[numProducts]);
    const validCells = cells.filter(cell => cell.isValid && cell.unitCost !== null);
    
    console.log(`🏆 Finding best price for quantity ${quantity}, ${numProducts} products:`, {
      totalCells: cells.length,
      validCells: validCells.length,
      validPrices: validCells.map(c => c.unitCost)
    });
    
    if (validCells.length === 0) {
      console.log(`⚠️ No valid cells for quantity ${quantity}, ${numProducts} products`);
      return null;
    }
    
    const bestPrice = Math.min(...validCells.map(cell => cell.unitCost!));
    console.log(`🎯 Best price found: ${bestPrice}`);
    return bestPrice;
  };

  const handleCellClick = (cell: PriceBreakCell) => {
    console.log("🖱️ Cell clicked:", {
      quoteId: cell.quote.id,
      supplierId: cell.quote.supplier_id,
      unitCost: cell.unitCost,
      quantity: cell.priceBreak.quantity
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

  if (comparisonData.length === 0 || uniqueProductCounts.length === 0) {
    console.log("❌ No comparison data available:", {
      comparisonDataLength: comparisonData.length,
      uniqueProductCountsLength: uniqueProductCounts.length,
      filteredQuotesLength: filteredQuotes.length
    });
    return (
      <div className="text-center p-8 border border-dashed rounded-md">
        <p className="text-muted-foreground">No price break data available for comparison.</p>
      </div>
    );
  }

  console.log("🎨 Rendering price break comparison table");

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            {/* Main header row */}
            <tr>
              <th className="border border-gray-300 p-3 bg-gray-50 font-semibold text-left" rowSpan={3}>
                Quantity
              </th>
              {uniqueProductCounts.map(count => (
                <th
                  key={count}
                  className="border border-gray-300 p-3 bg-gray-50 font-semibold text-center"
                  colSpan={uniqueSuppliers.length}
                >
                  {count} Product{count !== 1 ? 's' : ''}
                </th>
              ))}
            </tr>
            
            {/* Supplier names row */}
            <tr>
              {uniqueProductCounts.map(count => (
                uniqueSuppliers.map(supplier => (
                  <th
                    key={`${count}-${supplier.id}`}
                    className="border border-gray-300 p-2 bg-gray-100 text-sm font-medium text-center"
                  >
                    {supplier.name}
                  </th>
                ))
              ))}
            </tr>
            
            {/* Status row */}
            <tr>
              {uniqueProductCounts.map(count => (
                uniqueSuppliers.map(supplier => (
                  <th
                    key={`status-${count}-${supplier.id}`}
                    className="border border-gray-300 p-1 bg-gray-50 text-xs text-center"
                  >
                    Status
                  </th>
                ))
              ))}
            </tr>
          </thead>
          
          <tbody>
            {comparisonData.map(quantityData => (
              <tr key={quantityData.quantity}>
                <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                  {quantityData.quantity.toLocaleString()}
                </td>
                
                {uniqueProductCounts.map(numProducts => {
                  const bestPrice = getBestPriceForQuantityAndProducts(quantityData.quantity, numProducts);
                  
                  return uniqueSuppliers.map(supplier => {
                    const cell = quantityData.productCombinations[numProducts]?.[supplier.id];
                    
                    if (!cell) {
                      return (
                        <td
                          key={`${numProducts}-${supplier.id}`}
                          className="border border-gray-300 p-3 text-center text-gray-400"
                        >
                          N/A
                        </td>
                      );
                    }
                    
                    const isBest = cell.isValid && cell.unitCost === bestPrice && bestPrice !== null;
                    const currency = cell.quote.currency || 'USD';
                    
                    return (
                      <td
                        key={`${numProducts}-${supplier.id}`}
                        className="border border-gray-300 p-2 text-center"
                      >
                        <div className="space-y-1">
                          {/* Status badge */}
                          <div className="text-xs">
                            {cell.isDraft ? (
                              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                Draft
                              </Badge>
                            ) : cell.isExpired ? (
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
                            {cell.unitCost !== null ? (
                              <button
                                onClick={() => handleCellClick(cell)}
                                className={cn(
                                  "text-sm font-medium hover:underline cursor-pointer",
                                  cell.isExpired && "line-through text-gray-400",
                                  cell.isDraft && "text-gray-500"
                                )}
                              >
                                {formatCurrency(cell.unitCost, currency)}
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
                  });
                })}
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
