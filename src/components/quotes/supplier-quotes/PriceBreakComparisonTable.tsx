
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

export function PriceBreakComparisonTable({
  quotes,
  includeExpiredQuotes,
  includeDraftQuotes,
  onSelectQuote
}: PriceBreakComparisonTableProps) {
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);

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

  const { comparisonData, uniqueProductCounts, uniqueSuppliers } = useMemo(() => {
    const dataMap = new Map<number, PriceBreakComparisonData>();
    const productCounts = new Set<number>();
    const suppliers = new Map<string, { id: string; name: string }>();

    filteredQuotes.forEach(quote => {
      if (!quote.price_breaks || quote.price_breaks.length === 0) return;
      
      const isExpired = quote.valid_to ? new Date(quote.valid_to) < new Date() : false;
      const isDraft = quote.status === 'draft';
      const isValid = quote.status === 'submitted' && !isExpired;
      
      suppliers.set(quote.supplier_id, {
        id: quote.supplier_id,
        name: quote.supplier?.supplier_name || "Unknown Supplier"
      });

      quote.price_breaks.forEach(priceBreak => {
        const quantity = priceBreak.quantity;
        const numProducts = priceBreak.num_products || 1;
        
        productCounts.add(numProducts);

        if (!dataMap.has(quantity)) {
          dataMap.set(quantity, {
            quantity,
            productCombinations: {}
          });
        }

        const quantityData = dataMap.get(quantity)!;
        
        if (!quantityData.productCombinations[numProducts]) {
          quantityData.productCombinations[numProducts] = {};
        }

        quantityData.productCombinations[numProducts][quote.supplier_id] = {
          unitCost: priceBreak.unit_cost,
          quote,
          priceBreak,
          isExpired,
          isDraft,
          isValid
        };
      });
    });

    return {
      comparisonData: Array.from(dataMap.values()).sort((a, b) => a.quantity - b.quantity),
      uniqueProductCounts: Array.from(productCounts).sort((a, b) => a - b),
      uniqueSuppliers: Array.from(suppliers.values()).sort((a, b) => a.name.localeCompare(b.name))
    };
  }, [filteredQuotes]);

  const getBestPriceForQuantityAndProducts = (quantity: number, numProducts: number) => {
    const quantityData = comparisonData.find(d => d.quantity === quantity);
    if (!quantityData?.productCombinations[numProducts]) return null;

    const cells = Object.values(quantityData.productCombinations[numProducts]);
    const validCells = cells.filter(cell => cell.isValid && cell.unitCost !== null);
    
    if (validCells.length === 0) return null;
    
    return Math.min(...validCells.map(cell => cell.unitCost!));
  };

  const handleCellClick = (cell: PriceBreakCell) => {
    setSelectedQuote(cell.quote);
    setDetailsSheetOpen(true);
  };

  const handleApproveQuote = (quote: SupplierQuote) => {
    if (onSelectQuote) {
      onSelectQuote(quote);
      setDetailsSheetOpen(false);
    }
  };

  if (comparisonData.length === 0 || uniqueProductCounts.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-md">
        <p className="text-muted-foreground">No price break data available for comparison.</p>
      </div>
    );
  }

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
