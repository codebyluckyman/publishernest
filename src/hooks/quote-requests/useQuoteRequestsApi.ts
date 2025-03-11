
import { Organization } from '@/types/organization';
import { useQuoteRequestsQuery } from './useQuoteRequestsQuery';
import { useQuoteRequestsMutations } from './useQuoteRequestsMutations';
import { useQuoteRequestsFilter } from './useQuoteRequestsFilter';
import { SortQuoteRequestField, SortDirection } from '@/types/quoteRequest';

interface UseQuoteRequestsOptions {
  searchQuery?: string;
  filters?: {
    status: null | string;
    dueDate: null | string;
    [key: string]: any;
  };
  sortField?: SortQuoteRequestField;
  sortDirection?: SortDirection;
  refreshTrigger?: number;
}

export const useQuoteRequestsApi = (
  currentOrganization: Organization | null, 
  options: UseQuoteRequestsOptions = {}
) => {
  // Create the filter state
  const filterState = useQuoteRequestsFilter(
    options.filters,
    options.sortField,
    options.sortDirection
  );
  
  // Combine the provided options with the filter state
  const queryOptions = {
    searchQuery: options.searchQuery || filterState.searchQuery,
    filters: options.filters || filterState.filters,
    sortField: options.sortField || filterState.sortField,
    sortDirection: options.sortDirection || filterState.sortDirection,
    refreshTrigger: options.refreshTrigger || filterState.refreshTrigger
  };

  // Get query data
  const queryData = useQuoteRequestsQuery(currentOrganization, queryOptions);
  
  // Get mutation functions
  const mutations = useQuoteRequestsMutations(currentOrganization);

  // Return combined API
  return {
    ...queryData,
    ...mutations,
    ...filterState
  };
};
