import { useMemo, useState } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { formatDate, cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface PriceBreakComparisonTableProps {
  quotes: SupplierQuote[];
  formatId?: string;
  includeExpiredQuotes?: boolean;
  includeDraftQuotes?: boolean;
}

export function PriceBreakComparisonTable({ 
  quotes, 
  formatId, 
  includeExpiredQuotes = true, 
  includeDraftQuotes = false 
}: PriceBreakComparisonTableProps) {
  // Get number of products from the quote request format - default to 4 to handle all possible products
  const numProducts = useMemo(() => {
    if (!quotes.length) return 4;
    
    const quoteRequestFormat = quotes[0].quote_request?.formats?.find(f => 
      formatId ? f.id === formatId : true
    );
    
    // Always return at least 4 to check for all unit_cost_X fields
    return Math.max(quoteRequestFormat?.num_products || 1, 4);
  }, [quotes, formatId]);

  // Extract all unique price break quantities across all quotes for this format
  const quantities = useMemo(() => {
    const uniqueQuantities = new Set<number>();
    quotes.forEach(quote => {
      quote.price_breaks?.forEach(pb => {
        // Only include price breaks for the specific format if formatId is provided
        if (!formatId || pb.quote_request_format_id === formatId) {
          uniqueQuantities.add(pb.quantity);
        }
      });
    });
    return Array.from(uniqueQuantities).sort((a, b) => a - b);
  }, [quotes, formatId]);

  // Filter quotes based on status and validity
  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      // Filter by draft status if needed
      if (!includeDraftQuotes && quote.status === 'draft') {
        return false;
      }
      
      // Filter by validity if needed
      if (!includeExpiredQuotes) {
        const isExpired = quote.valid_to ? new Date(quote.valid_to) < new Date() : false;
        if (isExpired) return false;
      }
      
      return true;
    });
  }, [quotes, includeExpiredQuotes, includeDraftQuotes]);

  // Extract all unique suppliers after filtering
  const suppliers = useMemo(() => {
    return filteredQuotes.map(quote => {
      // Check quote validity
      const isValid = !quote.valid_to || new Date(quote.valid_to) >= new Date();
      const isDraft = quote.status === 'draft';
      
      return {
        id: quote.supplier_id,
        name: quote.supplier?.supplier_name || "Unknown Supplier",
        quote: quote,
        isValid,
        isDraft,
        validUntil: quote.valid_to
      };
    });
  }, [filteredQuotes]);

  // Extract product titles from quote request
  const productTitles = useMemo(() => {
    if (!filteredQuotes.length) return [];
    
    const quoteRequestFormat = filteredQuotes[0].quote_request?.formats?.find(f => 
      formatId ? f.id === formatId : true
    );
    
    const titles: string[] = [];
    
    for (let i = 0; i < numProducts; i++) {
      const product = quoteRequestFormat?.products?.[i];
      titles.push(`${i + 1}× ${product?.product_name || 'Product'}`);
    }
    
    return titles;
  }, [filteredQuotes, formatId, numProducts]);

  // Helper to check if a quote is valid
  const isQuoteValid = (quote: SupplierQuote) => {
    if (quote.status === 'draft') return false;
    return !quote.valid_to || new Date(quote.valid_to) >= new Date();
  };

  // Find the best price for a specific quantity and product index across all suppliers
  const getBestPrice = (quantity: number, productIndex: number) => {
    let bestPrice: { supplierId: string, price: number } | null = null;
    const unitCostKey = `unit_cost_${productIndex + 1}`;
    
    filteredQuotes.forEach(quote => {
      // Only consider valid quotes for "best" price
      if (!isQuoteValid(quote)) return;
      
      const priceBreak = quote.price_breaks?.find(pb => {
        // Match both quantity and format if formatId is provided
        if (formatId) {
          return pb.quantity === quantity && pb.quote_request_format_id === formatId;
        }
        return pb.quantity === quantity;
      });

      // Check if unit cost exists for this product index
      const unitCost = priceBreak ? priceBreak[unitCostKey] : null;

      if (unitCost !== null && unitCost !== undefined) {
        if (!bestPrice || unitCost < bestPrice.price) {
          bestPrice = {
            supplierId: quote.supplier_id,
            price: unitCost
          };
        }
      }
    });
    
    return bestPrice;
  };

  // Generate structured data for the consolidated table
  const tableData = useMemo(() => {
    const data: Array<{
      quantity: number,
      products: Array<{
        productIndex: number,
        productTitle: string,
        multiplier: number,
        totalQuantity: number,
        suppliers: Array<{
          supplierId: string,
          supplierName: string,
          unitCost: number | null,
          currency: string,
          isBest: boolean,
          isValid: boolean,
          isDraft: boolean
        }>
      }>
    }> = [];

    // For each quantity
    quantities.forEach(quantity => {
      const quantityRow = {
        quantity,
        products: [] as Array<{
          productIndex: number,
          productTitle: string,
          multiplier: number,
          totalQuantity: number,
          suppliers: Array<{
            supplierId: string,
            supplierName: string,
            unitCost: number | null,
            currency: string,
            isBest: boolean,
            isValid: boolean,
            isDraft: boolean
          }>
        }>
      };

      // For each product
      for (let productIndex = 0; productIndex < numProducts; productIndex++) {
        const productTitle = productTitles[productIndex] || `${productIndex + 1}× Product`;
        const multiplier = productIndex + 1; // Product index starts at 0, multiplier starts at 1
        const totalQuantity = quantity * multiplier;
        const bestPrice = getBestPrice(quantity, productIndex);
        
        // Skip products that don't have any price breaks
        let hasAnyData = false;
        
        // Collect data for each supplier
        const supplierData = suppliers.map(supplier => {
          const quote = supplier.quote;
          const priceBreak = quote.price_breaks?.find(pb => {
            // Match both quantity and format if formatId is provided
            if (formatId) {
              return pb.quantity === quantity && pb.quote_request_format_id === formatId;
            }
            return pb.quantity === quantity;
          });
          
          // Get the unit cost for this specific product index
          const unitCostKey = `unit_cost_${productIndex + 1}`;
          // Look for cost in the price break
          const unitCost = priceBreak && unitCostKey in priceBreak 
            ? priceBreak[unitCostKey] 
            : null;
            
          // Check if this is the best price
          const isBest = bestPrice?.supplierId === supplier.id && 
                         unitCost === bestPrice.price && 
                         unitCost !== null && 
                         supplier.isValid && 
                         !supplier.isDraft;
          
          if (unitCost !== null && unitCost !== undefined) {
            hasAnyData = true;
          }
          
          return {
            supplierId: supplier.id,
            supplierName: supplier.name,
            unitCost,
            currency: quote.currency || "USD",
            isBest,
            isValid: supplier.isValid,
            isDraft: supplier.isDraft
          };
        });
        
        // Only add the product if it has data from at least one supplier
        if (hasAnyData) {
          quantityRow.products.push({
            productIndex,
            productTitle,
            multiplier,
            totalQuantity,
            suppliers: supplierData
          });
        }
      }
      
      // Only add quantities that have at least one product with data
      if (quantityRow.products.length > 0) {
        data.push(quantityRow);
      }
    });
    
    return data;
  }, [quantities, numProducts, productTitles, suppliers, formatId]);

  if (tableData.length === 0) {
    return <div className="text-center py-6">No price break information available for comparison.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="sticky top-0 z-10">
              <TableHead className="sticky left-0 bg-white z-20 font-bold">Base Quantity</TableHead>
              <TableHead className="font-bold">Product</TableHead>
              <TableHead className="font-bold text-gray-500 text-xs">Total Units</TableHead>
              {suppliers.map(supplier => (
                <TableHead key={supplier.id} className="min-w-[120px]">
                  <div className="flex items-center space-x-1">
                    <span>{supplier.name}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {supplier.isDraft ? (
                            <AlertCircle size={16} className="text-amber-500" />
                          ) : supplier.isValid ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <XCircle size={16} className="text-red-500" />
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          {supplier.isDraft ? (
                            <span>Draft quote (not submitted)</span>
                          ) : supplier.isValid ? (
                            <span>Valid quote</span>
                          ) : (
                            <span>
                              Expired quote (valid until {supplier.validUntil ? formatDate(supplier.validUntil) : 'N/A'})
                            </span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map(row => (
              // For each quantity, render potentially multiple rows (one for each product)
              row.products.map((product, productIndex) => (
                <TableRow key={`${row.quantity}-${product.productIndex}`}>
                  {/* Show quantity only in the first row of each quantity group */}
                  {productIndex === 0 ? (
                    <TableCell 
                      className="sticky left-0 bg-white z-10 font-bold"
                      rowSpan={row.products.length}
                    >
                      {row.quantity.toLocaleString()}
                    </TableCell>
                  ) : null}
                  
                  <TableCell className="font-medium">
                    {product.productTitle}
                  </TableCell>
                  
                  <TableCell className="text-gray-500 text-xs">
                    {product.totalQuantity.toLocaleString()}
                  </TableCell>
                  
                  {/* For each supplier, show the price */}
                  {product.suppliers.map(supplier => (
                    <TableCell key={supplier.supplierId}>
                      {supplier.unitCost !== null ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center space-x-2">
                                <span className={cn(
                                  supplier.isBest && "font-medium", 
                                  (!supplier.isValid || supplier.isDraft) && "text-gray-400",
                                  !supplier.isValid && "line-through"
                                )}>
                                  {formatCurrency(supplier.unitCost, supplier.currency)}
                                </span>
                                {supplier.isBest && (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                    BEST
                                  </Badge>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {supplier.isDraft ? (
                                <span>Draft quote - not yet submitted</span>
                              ) : !supplier.isValid ? (
                                <span>Expired quote - no longer valid</span>
                              ) : supplier.isBest ? (
                                `Best price for ${product.multiplier}× quantity of ${row.quantity}`
                              ) : (
                                `Price for ${product.multiplier}× quantity of ${row.quantity}`
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 text-sm space-y-2">
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center">
            <Badge className="bg-green-100 text-green-800 mr-2">BEST</Badge>
            <span>= Best price available for that quantity and product multiplier</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-green-500" />
            <span>= Valid quote</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <XCircle size={16} className="text-red-500" />
            <span>= Expired quote</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-amber-500" />
            <span>= Draft quote (not submitted)</span>
          </div>
        </div>
        
        <div className="text-gray-600">
          <p>Note: The product multiplier (e.g., 2×) indicates the number of products being produced.</p>
          <p>For example, with a base quantity of 2,000 and 2× product multiplier, the total is 4,000 units.</p>
        </div>
      </div>
    </div>
  );
}
