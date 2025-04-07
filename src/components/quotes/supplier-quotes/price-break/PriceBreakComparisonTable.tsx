
import { useMemo, useState } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PriceBreakComparisonTableProps {
  quotes: SupplierQuote[];
  formatId?: string;
}

export function PriceBreakComparisonTable({ quotes, formatId }: PriceBreakComparisonTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [expandedView, setExpandedView] = useState<boolean>(false);

  // Get number of products from the quote request format
  const numProducts = useMemo(() => {
    if (!quotes.length) return 1;
    
    const quoteRequestFormat = quotes[0].quote_request?.formats?.find(f => 
      formatId ? f.id === formatId : true
    );
    
    return quoteRequestFormat?.num_products || 1;
  }, [quotes, formatId]);

  // Create product tabs based on number of products
  const productTabs = useMemo(() => {
    return Array.from({ length: numProducts }, (_, i) => ({
      index: i,
      label: `Product ${i + 1}`
    }));
  }, [numProducts]);

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

  // Find the best price for each quantity and product
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

      if (unitCost) {
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

  if (quantities.length === 0) {
    return <div className="text-center py-6">No price break information available for comparison.</div>;
  }

  // Generate the table for the selected product
  const renderPriceBreakTable = (productIndex: number) => {
    const unitCostKey = `unit_cost_${productIndex + 1}`;
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-white z-10 font-bold">Quantity</TableHead>
            {suppliers.map(supplier => (
              <TableHead key={supplier.id} className="min-w-[150px]">
                {supplier.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {quantities.map(quantity => {
            const bestPrice = getBestPrice(quantity, productIndex);
            
            return (
              <TableRow key={quantity}>
                <TableCell className="sticky left-0 bg-white z-10 font-bold">
                  {quantity.toLocaleString()}
                </TableCell>
                
                {suppliers.map(supplier => {
                  const quote = supplier.quote;
                  const priceBreak = quote.price_breaks?.find(pb => {
                    // Match both quantity and format if formatId is provided
                    if (formatId) {
                      return pb.quantity === quantity && pb.quote_request_format_id === formatId;
                    }
                    return pb.quantity === quantity;
                  });
                  
                  // Get the unit cost for this specific product index
                  const unitCost = priceBreak ? priceBreak[unitCostKey] : null;
                  
                  const isBest = bestPrice?.supplierId === supplier.id && 
                                unitCost === bestPrice.price && 
                                unitCost !== null;
                  
                  return (
                    <TableCell key={supplier.id} className={isBest ? "bg-green-50" : ""}>
                      {unitCost ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <span>{formatCurrency(unitCost, quote.currency || "USD")}</span>
                                {isBest && (
                                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                                    Best
                                  </Badge>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isBest ? "Best price for this quantity" : "Compare with other suppliers"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  // Enhanced view showing all products side by side
  const renderExpandedView = () => {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-white z-10">Quantity</TableHead>
              {suppliers.map(supplier => (
                [...Array(numProducts)].map((_, productIndex) => (
                  <TableHead 
                    key={`${supplier.id}-${productIndex}`} 
                    className="min-w-[120px] text-center border-l"
                    colSpan={productIndex === 0 ? 2 : 1}
                  >
                    {productIndex === 0 ? (
                      <div className="font-bold">{supplier.name}</div>
                    ) : null}
                    <div className={productIndex === 0 ? "mt-1" : ""}>
                      Product {productIndex + 1}
                    </div>
                  </TableHead>
                ))
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {quantities.map(quantity => (
              <TableRow key={quantity}>
                <TableCell className="sticky left-0 bg-white z-10 font-bold">
                  {quantity.toLocaleString()}
                </TableCell>
                
                {suppliers.map(supplier => (
                  [...Array(numProducts)].map((_, productIndex) => {
                    const quote = supplier.quote;
                    const priceBreak = quote.price_breaks?.find(pb => 
                      (!formatId || pb.quote_request_format_id === formatId) && 
                      pb.quantity === quantity
                    );
                    
                    const unitCostKey = `unit_cost_${productIndex + 1}`;
                    const unitCost = priceBreak ? priceBreak[unitCostKey] : null;
                    
                    const bestPrice = getBestPrice(quantity, productIndex);
                    const isBest = bestPrice?.supplierId === supplier.id && unitCost === bestPrice.price;
                    
                    return (
                      <TableCell 
                        key={`${supplier.id}-${productIndex}`} 
                        className={`${isBest ? "bg-green-50" : ""} border-l`}
                      >
                        {unitCost ? (
                          <div className="flex items-center justify-center">
                            <span>{formatCurrency(unitCost, quote.currency || "USD")}</span>
                            {isBest && (
                              <Badge className="ml-1 bg-green-100 text-green-800 hover:bg-green-200">
                                Best
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                    );
                  })
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* View toggle button */}
      {numProducts > 1 && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpandedView(!expandedView)}
            className="flex items-center"
          >
            {expandedView ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Collapse View
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Expanded View
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Product tabs (only show in non-expanded mode) */}
      {numProducts > 1 && !expandedView ? (
        <Tabs 
          defaultValue={`product-0`} 
          value={`product-${selectedProduct}`}
          onValueChange={(value) => setSelectedProduct(parseInt(value.split('-')[1]))}
        >
          <TabsList className="mb-4">
            {productTabs.map(tab => (
              <TabsTrigger key={tab.index} value={`product-${tab.index}`}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {productTabs.map(tab => (
            <TabsContent key={tab.index} value={`product-${tab.index}`} className="overflow-auto">
              {renderPriceBreakTable(tab.index)}
            </TabsContent>
          ))}
        </Tabs>
      ) : numProducts === 1 || !expandedView ? (
        // Single product or normal view
        <div className="overflow-auto">
          {renderPriceBreakTable(selectedProduct)}
        </div>
      ) : (
        // Expanded view with all products
        renderExpandedView()
      )}
      
      <div className="mt-4 text-sm text-gray-600 flex items-center">
        <Badge className="bg-green-100 text-green-800 mr-2">Best</Badge>
        <span>= Best price available for that quantity</span>
      </div>
    </div>
  );
}
