
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuoteRequest } from "@/types/quoteRequest";

type FormatCountButtonProps = {
  request: QuoteRequest;
  onClick: (request: QuoteRequest) => void;
};

export const FormatCountButton = ({ request, onClick }: FormatCountButtonProps) => {
  if (request.formats && request.formats.length > 0) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
          >
            {request.formats.length} format{request.formats.length !== 1 ? 's' : ''}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-2 w-fit">
          <div className="text-sm font-medium mb-2">Formats:</div>
          <div className="space-y-1">
            {request.formats.map((format, index) => (
              <div key={index} className="text-sm">
                {format.format_name || 'Unnamed Format'}
                {format.quantity && ` (${format.quantity})`}
              </div>
            ))}
          </div>
          <Button 
            variant="link" 
            size="sm" 
            className="mt-2 h-6 p-0" 
            onClick={() => onClick(request)}
          >
            View Details
          </Button>
        </PopoverContent>
      </Popover>
    );
  }
  
  return <span className="text-muted-foreground text-sm">None</span>;
};
