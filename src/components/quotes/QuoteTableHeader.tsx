
import { RefreshCw, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Organization } from "@/types/organization";

interface QuoteTableHeaderProps {
  currentOrganization: Organization | null;
  handleAddQuote: () => void;
  handleRefresh: () => void;
  isLoading: boolean;
}

export const QuoteTableHeader = ({
  currentOrganization,
  handleAddQuote,
  handleRefresh,
  isLoading
}: QuoteTableHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-2xl font-bold tracking-tight">
        Supplier Quotes
        {currentOrganization && (
          <span className="text-sm font-normal text-muted-foreground ml-2">
            {currentOrganization.name}
          </span>
        )}
      </h2>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button size="sm" onClick={handleAddQuote} disabled={!currentOrganization}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Quote
        </Button>
      </div>
    </div>
  );
};
