
import { Organization } from '@/types/organization';
import { useQuotesFilters } from './quotes/useQuotesFilters';
import { useQuotesQuery } from './quotes/useQuotesQuery';
import { useQuoteMutations } from './quotes/useQuoteMutations';

export const useQuotesApi = (currentOrganization: Organization | null) => {
  // Get filter state and handlers
  const {
    sortField,
    sortDirection,
    statusFilter,
    searchQuery,
    quoteRequestFilter,
    handleSort,
    setStatusFilter,
    setSearchQuery,
    setQuoteRequestFilter
  } = useQuotesFilters();

  // Get quotes data with current filters
  const { quotes, isLoading, refetch } = useQuotesQuery(
    currentOrganization,
    sortField,
    sortDirection,
    statusFilter,
    searchQuery,
    quoteRequestFilter
  );

  // Get mutation functions
  const { createQuote, updateQuote, deleteQuote } = useQuoteMutations(currentOrganization);

  return {
    // Query data
    quotes,
    isLoading,
    refetch,
    
    // Mutations
    createQuote,
    updateQuote,
    deleteQuote,
    
    // Filters state and handlers
    sortField,
    sortDirection,
    handleSort,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    quoteRequestFilter,
    setQuoteRequestFilter
  };
};
