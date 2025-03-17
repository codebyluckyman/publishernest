
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuoteRequest, QuoteRequestFormat } from "@/types/quoteRequest";
import { Badge } from "@/components/ui/badge";

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
                  <span className="text-muted-foreground">Qty: {format.quantity}</span>
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
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
