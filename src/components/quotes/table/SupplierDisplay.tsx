
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { QuoteRequest } from "@/types/quoteRequest";

export interface SupplierDisplayProps {
  supplierName: string;
  supplierNames: string[];
  onClick?: (request: QuoteRequest) => void;
  request?: QuoteRequest;
}

export function SupplierDisplay({ 
  supplierName, 
  supplierNames, 
  onClick, 
  request 
}: SupplierDisplayProps) {
  // If there's only one supplier or no suppliers, just show the name
  if (!supplierNames || supplierNames.length <= 1) {
    return <p className="font-medium">{supplierName || 'Unknown'}</p>;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && request) {
      e.stopPropagation();
      onClick(request);
    }
  };

  // If there are multiple suppliers, show the first with a +X more
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center cursor-pointer" onClick={handleClick}>
          <p className="font-medium mr-2">{supplierName}</p>
          <Badge variant="outline">
            +{supplierNames.length - 1} more
          </Badge>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="p-3">
          <h4 className="text-sm font-medium mb-2">All Suppliers</h4>
          <ul className="space-y-1">
            {supplierNames.map((name, index) => (
              <li key={index} className="text-sm">{name}</li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
