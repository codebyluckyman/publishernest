
import { QuoteRequest } from "@/types/quoteRequest";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FormatCountButtonProps {
  request: QuoteRequest;
  onClick: (request: QuoteRequest) => void;
}

export function FormatCountButton({ request, onClick }: FormatCountButtonProps) {
  const formatCount = request.formats?.length || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 text-xs"
        >
          {formatCount} Format{formatCount !== 1 ? 's' : ''}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3">
          <div className="font-semibold mb-2">Formats</div>
          {formatCount > 0 ? (
            <div className="space-y-2">
              {request.formats?.map((format) => (
                <div key={format.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{format.format_name}</span>
                  <span className="text-muted-foreground">Qty: {format.quantity}</span>
                </div>
              ))}
              <Button 
                variant="link" 
                size="sm" 
                className="mt-2 p-0 h-auto text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  onClick(request);
                }}
              >
                View Details
              </Button>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">No formats specified</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
