
import { useState, useEffect } from "react";
import { Organization } from "@/types/organization";
import { QuoteEmptyState } from "./QuoteEmptyState";
import { QuoteTableHeader } from "./QuoteTableHeader";
import { QuoteFilters } from "./QuoteFilters";
import { QuotesTable } from "./QuotesTable";
import { QuoteDialog } from "./QuoteDialog";
import { useQuotesApi } from "@/hooks/useQuotesApi";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest } from "@/types/quoteRequest";
import { useSearchParams } from "react-router-dom";

interface QuoteTableContainerProps {
  currentOrganization: Organization | null;
}

export const QuoteTableContainer = ({ currentOrganization }: QuoteTableContainerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const initialRequestId = searchParams.get('requestId');
  
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
    setSearchQuery,
    quoteRequestFilter,
    setQuoteRequestFilter
  } = useQuotesApi(currentOrganization);

  // Set initial quote request filter from URL
  useEffect(() => {
    if (initialRequestId) {
      setQuoteRequestFilter(initialRequestId);
    }
  }, [initialRequestId]);

  // Fetch quote requests for dropdown
  const { data: quoteRequests } = useQuery({
    queryKey: ['quoteRequests', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      const { data, error } = await supabase
        .from('quote_requests')
        .select('id, title')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching quote requests:', error);
        return [];
      }
      return data as Pick<QuoteRequest, 'id' | 'title'>[];
    },
    enabled: !!currentOrganization,
  });

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
            quoteRequestFilter={quoteRequestFilter}
            setQuoteRequestFilter={setQuoteRequestFilter}
            quoteRequests={quoteRequests || []}
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
        initialQuoteRequestId={quoteRequestFilter}
      />
    </div>
  );
};
