
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { FormatSpecifications } from "../../form/FormatSpecifications";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";
import { QuoteRequestFormat } from "@/types/quoteRequest";

interface FormatAccordionProps {
  formats: QuoteRequestFormat[];
}

export function FormatAccordion({ formats }: FormatAccordionProps) {
  // Helper function to format numbers with thousand separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
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
                        <TableCell className="font-medium">
                          {product.product_name || 'Unknown Product'}
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
