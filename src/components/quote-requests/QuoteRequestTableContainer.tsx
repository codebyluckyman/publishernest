
import { useState } from "react";
import { Organization } from "@/types/organization";
import { QuoteRequestEmptyState } from "./QuoteRequestEmptyState";
import { QuoteRequestTableHeader } from "./QuoteRequestTableHeader";
import { QuoteRequestFilters } from "./QuoteRequestFilters";
import { QuoteRequestsTable } from "./QuoteRequestsTable";
import { QuoteRequestDialog } from "./QuoteRequestDialog";
import { useQuoteRequestsApi } from "@/hooks/useQuoteRequestsApi";

interface QuoteRequestTableContainerProps {
  currentOrganization: Organization | null;
}

export const QuoteRequestTableContainer = ({ currentOrganization }: QuoteRequestTableContainerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const {
    quoteRequests,
    isLoading,
    refetch,
    sortField,
    sortDirection,
    handleSort,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery
  } = useQuoteRequestsApi(currentOrganization);

  const handleAddQuoteRequest = () => {
    setIsAddDialogOpen(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <QuoteRequestTableHeader
        currentOrganization={currentOrganization}
        handleAddQuoteRequest={handleAddQuoteRequest}
        handleRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : !quoteRequests || quoteRequests.length === 0 ? (
        <QuoteRequestEmptyState
          hasOrganization={!!currentOrganization}
          onAddQuoteRequest={handleAddQuoteRequest}
        />
      ) : (
        <div className="space-y-4">
          <QuoteRequestFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
          
          <QuoteRequestsTable
            quoteRequests={quoteRequests}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            currentOrganization={currentOrganization}
          />
        </div>
      )}

      {/* Add Dialog */}
      <QuoteRequestDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        currentOrganization={currentOrganization}
      />
    </div>
  );
};
