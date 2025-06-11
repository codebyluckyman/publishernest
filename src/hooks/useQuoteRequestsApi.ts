
import { useQuoteRequests } from "./useQuoteRequests";
import { 
  fetchQuoteRequests,
  createQuoteRequest,
  updateQuoteRequest,
  updateQuoteRequestStatus,
  deleteQuoteRequest
} from "@/api/quoteRequestsApi";
import { fetchQuoteRequestAudit } from "@/api/quoteRequests/quoteRequestAudit";
import { useOrganization } from "./useOrganization";
import { useQuery } from "@tanstack/react-query";

/**
 * API hook for quote requests, used for backward compatibility
 * 
 * @deprecated Use the individual hooks from useQuoteRequests instead
 */
export function useQuoteRequestsApi() {
  const { currentOrganization } = useOrganization();
  const {
    useQuoteRequestsList,
    useCreateQuoteRequest,
    useUpdateQuoteRequest,
    useUpdateQuoteRequestStatus,
    useDeleteQuoteRequest,
    useQuoteRequestAudit
  } = useQuoteRequests();

  // Get quote requests using the new hook
  const { 
    data: quoteRequests = [], 
    isLoading,
    isError,
    error
  } = useQuoteRequestsList(currentOrganization);

  // Create mutation hooks
  const { 
    mutateAsync: createQuoteRequestAsync, 
    isPending: isCreating 
  } = useCreateQuoteRequest();
  
  const { 
    mutateAsync: updateQuoteRequestAsync, 
    isPending: isUpdating 
  } = useUpdateQuoteRequest();
  
  const { 
    mutateAsync: deleteQuoteRequestAsync, 
    isPending: isDeleting 
  } = useDeleteQuoteRequest();

  // Create compatibility wrappers for the old API
  const createQuoteRequestCompat = async (data: any, organizationId: string, userId: string) => {
    return createQuoteRequestAsync({ formData: data, organizationId });
  };

  const updateQuoteRequestCompat = async (id: string, updates: any, userId: string) => {
    return updateQuoteRequestAsync({ id, updates });
  };

  const deleteQuoteRequestCompat = async (id: string, userId: string) => {
    return deleteQuoteRequestAsync(id);
  };

  return {
    // Raw functions from API
    fetchQuoteRequests,
    createQuoteRequest: createQuoteRequestCompat,
    updateQuoteRequest: updateQuoteRequestCompat,
    deleteQuoteRequest: deleteQuoteRequestCompat,
    updateQuoteRequestStatus,
    fetchQuoteRequestAudit,
    
    // React Query hooks
    useQuoteRequests: useQuoteRequestsList, // Renamed for backward compatibility
    useCreateQuoteRequest,
    useUpdateQuoteRequest,
    useUpdateQuoteRequestStatus,
    useDeleteQuoteRequest,
    useQuoteRequestAudit,
    
    // Legacy-style properties
    quoteRequests,
    isLoading,
    isError,
    error,
    isCreating,
    isUpdating,
    isDeleting
  };
}
