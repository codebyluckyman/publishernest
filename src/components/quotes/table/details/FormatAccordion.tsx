
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { FormatSpecifications } from "../../form/FormatSpecifications";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";
import { QuoteRequestFormat } from "@/types/quoteRequest";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface FormatAccordionProps {
  formats: QuoteRequestFormat[];
}

export function FormatAccordion({ formats }: FormatAccordionProps) {
  // Helper function to format numbers with thousand separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  // Render format extras badges
  const renderFormatExtras = (product: any) => {
    if (!product.format_extras) return null;

    const activeExtras = Object.entries(product.format_extras)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    if (activeExtras.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {activeExtras.map((extra) => (
          <Badge key={extra} variant="outline" className="capitalize text-xs">
            {extra.replace('_', ' ')}
          </Badge>
        ))}
        
        {product.format_extra_comments && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help">
                  <Info className="h-3 w-3 mr-1" />
                  Details
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">{product.format_extra_comments}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {formats.map((format) => {
        // Use the useFormatDetails hook to get format specifications
        const { data: formatDetails, isLoading } = useFormatDetails(format.format_id);
        
        return (
          <AccordionItem key={format.id} value={format.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between w-full pr-4">
                <span>{format.format_name || 'Unknown Format'}</span>
                <span className="text-sm text-muted-foreground">Qty: {formatNumber(format.quantity)}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {/* Show format specifications */}
              <div className="mb-3">
                <FormatSpecifications format={formatDetails} isLoading={isLoading} />
              </div>
              
              {format.notes && (
                <div className="mb-3 text-sm">
                  <span className="font-medium">Notes:</span> {format.notes}
                </div>
              )}
              
              {format.products && format.products.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {format.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <span className="font-medium">
                              {product.product_name || 'Unknown Product'}
                            </span>
                            {renderFormatExtras(product)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatNumber(product.quantity)}</TableCell>
                        {product.notes && (
                          <TableCell className="text-sm text-muted-foreground">
                            {product.notes}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No products specified for this format</p>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
