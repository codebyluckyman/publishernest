
import { useState } from "react";
import { Organization } from "@/types/organization";
import { QuoteEmptyState } from "./QuoteEmptyState";
import { QuoteTableHeader } from "./QuoteTableHeader";
import { QuoteFilters } from "./QuoteFilters";
import { QuotesTable } from "./QuotesTable";
import { QuoteDialog } from "./QuoteDialog";
import { useQuotesApi } from "@/hooks/useQuotesApi";

interface QuoteTableContainerProps {
  currentOrganization: Organization | null;
}

export const QuoteTableContainer = ({ currentOrganization }: QuoteTableContainerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const {
    quotes,
    isLoading,
    refetch,
    sortField,
    sortDirection,
    handleSort,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery
  } = useQuotesApi(currentOrganization);

  const handleAddQuote = () => {
    setIsAddDialogOpen(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <QuoteTableHeader
        currentOrganization={currentOrganization}
        handleAddQuote={handleAddQuote}
        handleRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : !quotes || quotes.length === 0 ? (
        <QuoteEmptyState
          hasOrganization={!!currentOrganization}
          onAddQuote={handleAddQuote}
        />
      ) : (
        <div className="space-y-4">
          <QuoteFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
          
          <QuotesTable
            quotes={quotes}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            currentOrganization={currentOrganization}
          />
        </div>
      )}

      {/* Add Dialog */}
      <QuoteDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        currentOrganization={currentOrganization}
      />
    </div>
  );
};
