
import { Button } from "@/components/ui/button";
import { QuoteRequest } from "@/types/quoteRequest";

type FormatCountButtonProps = {
  request: QuoteRequest;
  onClick: (request: QuoteRequest) => void;
};

export const FormatCountButton = ({ request, onClick }: FormatCountButtonProps) => {
  if (request.formats && request.formats.length > 0) {
    return (
      <Button 
        variant="secondary" 
        size="sm" 
        className="hover:bg-secondary/80" 
        onClick={() => onClick(request)}
      >
        {request.formats.length} format{request.formats.length !== 1 ? 's' : ''}
      </Button>
    );
  }
  
  return <span className="text-muted-foreground text-sm">None</span>;
};
