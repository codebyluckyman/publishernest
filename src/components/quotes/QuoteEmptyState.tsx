
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteEmptyStateProps {
  hasOrganization: boolean;
  onAddQuote: () => void;
}

export const QuoteEmptyState = ({ hasOrganization, onAddQuote }: QuoteEmptyStateProps) => {
  if (!hasOrganization) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-gray-50 border-dashed">
        <h3 className="mb-2 text-lg font-medium">No Organization Selected</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Please select or create an organization to manage supplier quotes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-gray-50 border-dashed">
      <h3 className="mb-2 text-lg font-medium">No Quotes Yet</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Create your first supplier quote to start tracking pricing and terms.
      </p>
      <Button onClick={onAddQuote} className="gap-2">
        <PlusCircle className="w-4 h-4" />
        Create Quote
      </Button>
    </div>
  );
};
