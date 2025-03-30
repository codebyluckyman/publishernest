
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuoteRequest, QuoteRequestFormat } from "@/types/quoteRequest";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface FormatCountButtonProps {
  formats: QuoteRequestFormat[];
  onClick?: (request: QuoteRequest) => void;
  request?: QuoteRequest;
}

export function FormatCountButton({ formats, onClick, request }: FormatCountButtonProps) {
  if (!formats || formats.length === 0) return null;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && request) {
      e.stopPropagation();
      onClick(request);
    }
  };

  // Helper function to render format extras
  const renderFormatExtras = (product: any) => {
    if (!product.format_extras) return null;

    // Check if format_extras is an object with boolean values
    if (typeof product.format_extras === 'object') {
      const activeExtras = Object.entries(product.format_extras)
        .filter(([_, value]) => value === true)
        .map(([key]) => key);

      if (activeExtras.length === 0) return null;

      return (
        <div className="space-y-1 mt-1">
          <div className="flex flex-wrap gap-1">
            {activeExtras.map((extra) => (
              <Badge key={extra} variant="outline" className="capitalize text-xs">
                {extra.replace('_', ' ')}
              </Badge>
            ))}
          </div>
          
          {product.format_extra_comments && (
            <div className="mt-1 p-2 bg-slate-50 rounded-md border text-xs text-slate-700">
              <p className="text-xs">{product.format_extra_comments}</p>
            </div>
          )}
        </div>
      );
    }

    // If format_extras is an array
    if (Array.isArray(product.format_extras) && product.format_extras.length > 0) {
      return (
        <div className="space-y-1 mt-1">
          <div className="flex flex-wrap gap-1">
            {product.format_extras.map((extra, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {typeof extra === 'string' ? extra : extra.name}
              </Badge>
            ))}
          </div>
          
          {product.format_extra_comments && (
            <div className="mt-1 p-2 bg-slate-50 rounded-md border text-xs text-slate-700">
              <p className="text-xs">{product.format_extra_comments}</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Helper function to render the price breaks section
  const renderPriceBreaks = (format: QuoteRequestFormat) => {
    if (!format.price_breaks || format.price_breaks.length === 0) return null;

    return (
      <div className="mt-3">
        <h5 className="text-xs font-medium mb-1">
          Price Break Requests 
          <span className="ml-1 text-xs text-muted-foreground">
            ({format.num_products || 1} product{(format.num_products || 1) !== 1 ? 's' : ''})
          </span>
        </h5>
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="p-1">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {format.price_breaks.map((priceBreak, idx) => (
              <TableRow key={priceBreak.id || idx}>
                <TableCell className="p-1">
                  {priceBreak.quantity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          onClick={handleClick}
        >
          {formats.length} format{formats.length !== 1 ? "s" : ""}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4">
          <h4 className="font-medium mb-2">Format Details</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {formats.map((format) => (
              <div key={format.id} className="border rounded p-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{format.format_name || 'Unknown Format'}</span>
                </div>
                {format.notes && <p className="text-xs mt-1 text-muted-foreground">{format.notes}</p>}
                
                {format.products && format.products.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {format.products.map(product => (
                      <div key={product.id} className="border-t pt-1">
                        <span className="font-medium text-xs">{product.product_name}</span>
                        {renderFormatExtras(product)}
                      </div>
                    ))}
                  </div>
                )}

                {renderPriceBreaks(format)}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
