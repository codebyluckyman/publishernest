
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { FormatSpecifications } from "../../form/FormatSpecifications";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";
import { QuoteRequestFormat } from "@/types/quoteRequest";
import { Badge } from "@/components/ui/badge";

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
    if (!product.format_extras || product.format_extras.length === 0) return null;

    return (
      <div className="space-y-1">
        <div className="flex flex-wrap gap-1 mt-1">
          {product.format_extras.map((extra: any, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {extra.name}
            </Badge>
          ))}
        </div>
        
        {product.format_extra_comments && (
          <div className="mt-1 p-2 bg-slate-50 rounded-md border text-xs text-slate-800">
            <p>{product.format_extra_comments}</p>
          </div>
        )}
      </div>
    );
  };

  // Helper function to render the price breaks table
  const renderPriceBreaks = (format: QuoteRequestFormat) => {
    if (!format.price_breaks || format.price_breaks.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">
          Price Break Requests 
          <span className="ml-2 text-sm text-muted-foreground">
            ({format.num_products || 1} product{(format.num_products || 1) !== 1 ? 's' : ''})
          </span>
        </h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {format.price_breaks.map((priceBreak, idx) => (
              <TableRow key={priceBreak.id || idx}>
                <TableCell>
                  {formatNumber(priceBreak.quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
              
              {/* Show price breaks */}
              {renderPriceBreaks(format)}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
