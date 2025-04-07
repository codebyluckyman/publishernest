
import { useMemo } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface PriceBreakComparisonTableProps {
  quotes: SupplierQuote[];
  formatId?: string;
}

export function PriceBreakComparisonTable({ quotes, formatId }: PriceBreakComparisonTableProps) {
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

  // Extract all unique suppliers
  const suppliers = useMemo(() => {
    return quotes.map(quote => ({
      id: quote.supplier_id,
      name: quote.supplier?.supplier_name || "Unknown Supplier",
      quote: quote
    }));
  }, [quotes]);

  // Extract product titles from quote request
  const productTitles = useMemo(() => {
    if (!quotes.length) return [];
    
    const quoteRequestFormat = quotes[0].quote_request?.formats?.find(f => 
      formatId ? f.id === formatId : true
    );
    
    const titles: string[] = [];
    
    for (let i = 0; i < numProducts; i++) {
      const product = quoteRequestFormat?.products?.[i];
      // Show the product name with multiplier to indicate number of products
      titles.push(`${i + 1}× ${product?.product_name || 'Product'}`);
    }
    
    return titles;
  }, [quotes, formatId, numProducts]);

  // Find the best price for a specific quantity and product index across all suppliers
  const getBestPrice = (quantity: number, productIndex: number) => {
    let bestPrice: { supplierId: string, price: number } | null = null;
    const unitCostKey = `unit_cost_${productIndex + 1}`;
    
    quotes.forEach(quote => {
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
          isBest: boolean
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
            isBest: boolean
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
                         unitCost !== null;
          
          if (unitCost !== null && unitCost !== undefined) {
            hasAnyData = true;
          }
          
          return {
            supplierId: supplier.id,
            supplierName: supplier.name,
            unitCost,
            currency: quote.currency || "USD",
            isBest
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
              <TableHead className="font-bold">Product Multiplier</TableHead>
              <TableHead className="font-bold text-gray-500 text-xs">(Total Units)</TableHead>
              {suppliers.map(supplier => (
                <TableHead key={supplier.id} className="min-w-[120px]">
                  {supplier.name}
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
                    ({product.totalQuantity.toLocaleString()} units)
                  </TableCell>
                  
                  {/* For each supplier, show the price */}
                  {product.suppliers.map(supplier => (
                    <TableCell key={supplier.supplierId}>
                      {supplier.unitCost !== null ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center space-x-2">
                                <span className={supplier.isBest ? "font-medium" : ""}>
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
                              {supplier.isBest 
                                ? `Best price for ${product.multiplier}× quantity of ${row.quantity}`
                                : `Price for ${product.multiplier}× quantity of ${row.quantity}`
                              }
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
        <div className="flex items-center">
          <Badge className="bg-green-100 text-green-800 mr-2">BEST</Badge>
          <span>= Best price available for that quantity and product multiplier</span>
        </div>
        <div className="text-gray-600">
          <p>Note: The multiplier (e.g., 2×) indicates how many times the base quantity is being produced.</p>
          <p>For example, with a base quantity of 2,000 and 2× multiplier, the total is 4,000 units.</p>
        </div>
      </div>
    </div>
  );
}
