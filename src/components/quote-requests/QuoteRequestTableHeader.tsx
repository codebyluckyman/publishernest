
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Organization } from "@/types/organization";

interface QuoteRequestTableHeaderProps {
  currentOrganization: Organization | null;
  handleAddQuoteRequest: () => void;
  handleRefresh: () => void;
  isLoading: boolean;
}

export function QuoteRequestTableHeader({
  currentOrganization,
  handleAddQuoteRequest,
  handleRefresh,
  isLoading
}: QuoteRequestTableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quote Requests</h1>
        <p className="text-muted-foreground">
          {currentOrganization
            ? `Manage quote requests for ${currentOrganization.name}`
            : "Select an organization to manage quote requests"}
        </p>
      </div>
      <div className="flex gap-2 self-end sm:self-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
        <Button
          onClick={handleAddQuoteRequest}
          disabled={!currentOrganization}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Quote Request
        </Button>
      </div>
    </div>
  );
}
