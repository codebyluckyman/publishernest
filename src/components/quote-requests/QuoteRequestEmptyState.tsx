
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

interface QuoteRequestEmptyStateProps {
  hasOrganization: boolean;
  onAddQuoteRequest: () => void;
}

export function QuoteRequestEmptyState({ hasOrganization, onAddQuoteRequest }: QuoteRequestEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
      <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">
        {hasOrganization 
          ? "No quote requests found" 
          : "Select an organization to view quote requests"}
      </h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {hasOrganization
          ? "Create your first quote request to start collecting quotes from suppliers."
          : "You need to select or create an organization before you can manage quote requests."}
      </p>
      {hasOrganization && (
        <Button onClick={onAddQuoteRequest}>
          Create Quote Request
        </Button>
      )}
    </div>
  );
}
