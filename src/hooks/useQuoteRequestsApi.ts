
import { useQuoteRequests } from "./useQuoteRequests";
import { 
  fetchQuoteRequests,
  createQuoteRequest,
  updateQuoteRequest,
  updateQuoteRequestStatus,
  deleteQuoteRequest
} from "@/api/quoteRequestsApi";
import { fetchQuoteRequestAudit } from "@/api/quoteRequests/quoteRequestAudit";

/**
 * API hook for quote requests, used for backward compatibility
 * 
 * @deprecated Use the individual hooks from useQuoteRequests instead
 */
export function useQuoteRequestsApi() {
  const {
    useQuoteRequestsList,
    useCreateQuoteRequest,
    useUpdateQuoteRequest,
    useUpdateQuoteRequestStatus,
    useDeleteQuoteRequest,
    useQuoteRequestAudit
  } = useQuoteRequests();

  return {
    // Raw functions
    fetchQuoteRequests,
    createQuoteRequest,
    updateQuoteRequest,
    updateQuoteRequestStatus,
    deleteQuoteRequest,
    fetchQuoteRequestAudit,
    
    // React Query hooks
    useQuoteRequests: useQuoteRequestsList, // Renamed for backward compatibility
    useCreateQuoteRequest,
    useUpdateQuoteRequest,
    useUpdateQuoteRequestStatus,
    useDeleteQuoteRequest,
    useQuoteRequestAudit
  };
}
