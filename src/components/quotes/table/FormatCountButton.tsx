
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuoteRequest, QuoteRequestFormat } from "@/types/quoteRequest";

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
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
