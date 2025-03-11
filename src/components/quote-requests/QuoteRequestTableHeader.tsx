
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Organization } from "@/types/organization";

interface QuoteRequestTableHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  toggleFilters: () => void;
  onAddQuoteRequest: () => void;
  areFiltersActive: () => boolean;
  activeFiltersCount: number;
  currentOrganization: Organization | null;
  isLoading: boolean;
  handleRefresh: () => void;
}

export function QuoteRequestTableHeader({
  searchQuery,
  setSearchQuery,
  showFilters,
  toggleFilters,
  onAddQuoteRequest,
  areFiltersActive,
  activeFiltersCount,
  currentOrganization,
  isLoading,
  handleRefresh
}: QuoteRequestTableHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <CardTitle>Quote Requests</CardTitle>
        <CardDescription>
          {currentOrganization
            ? `Manage quote requests for ${currentOrganization.name}`
            : "Select an organization to manage quote requests"}
        </CardDescription>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search quote requests..."
            className="w-full md:w-[260px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="gap-1"
          onClick={toggleFilters}
        >
          Filters {areFiltersActive() && (
            <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        <Button 
          className="gap-1" 
          onClick={onAddQuoteRequest} 
          disabled={!currentOrganization}
        >
          <PlusCircle className="h-4 w-4" />
          Add Quote Request
        </Button>
      </div>
    </div>
  );
}
