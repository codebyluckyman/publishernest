
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuoteRequest } from "@/types/quoteRequest";

type SupplierDisplayProps = {
  request: QuoteRequest;
};

export const SupplierDisplay = ({ request }: SupplierDisplayProps) => {
  if (request.supplier_ids && request.supplier_ids.length > 1) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            {request.supplier_ids.length} suppliers
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-2 w-fit">
          <div className="text-sm font-medium mb-2">Suppliers:</div>
          <div className="space-y-1">
            {request.supplier_names && request.supplier_names.map((name, index) => (
              <div key={index} className="text-sm">{name}</div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
  
  return request.supplier_names && request.supplier_names.length > 0 
    ? request.supplier_names[0] 
    : request.supplier_name || 'Unknown';
};
