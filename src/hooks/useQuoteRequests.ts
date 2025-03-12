
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Organization } from "@/types/organization";
import { QuoteRequest, QuoteRequestFormValues } from "@/types/quoteRequest";
import { useAuth } from "@/context/AuthContext";
import { 
  fetchQuoteRequests,
  createQuoteRequest,
  updateQuoteRequest,
  updateQuoteRequestStatus,
  deleteQuoteRequest
} from "@/api/quoteRequestsApi";

/**
 * Custom hook for managing quote requests with React Query
 */
export function useQuoteRequests() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /**
   * Hook to fetch quote requests
   */
  const useQuoteRequestsList = (
    currentOrganization: Organization | null,
    status?: string,
    searchQuery?: string
  ) => {
    return useQuery({
      queryKey: ["quoteRequests", currentOrganization?.id, status, searchQuery],
      queryFn: () => fetchQuoteRequests({ currentOrganization, status, searchQuery }),
      enabled: !!currentOrganization,
      onError: (error: any) => {
        toast.error(error.message || "Failed to load quote requests");
      }
    });
  };

  /**
   * Hook to create a new quote request
   */
  const useCreateQuoteRequest = () => {
    return useMutation({
      mutationFn: ({ formData, organizationId }: { formData: QuoteRequestFormValues; organizationId: string }) => {
        if (!user) {
          throw new Error("User not authenticated");
        }
        return createQuoteRequest(formData, organizationId, user.id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["quoteRequests"] });
        toast.success("Quote request created successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create quote request");
      }
    });
  };

  /**
   * Hook to update a quote request
   */
  const useUpdateQuoteRequest = () => {
    return useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: Partial<QuoteRequestFormValues> }) => 
        updateQuoteRequest(id, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["quoteRequests"] });
        toast.success("Quote request updated successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update quote request");
      }
    });
  };

  /**
   * Hook to update a quote request status
   */
  const useUpdateQuoteRequestStatus = () => {
    return useMutation({
      mutationFn: ({ id, status }: { id: string; status: 'pending' | 'approved' | 'declined' }) =>
        updateQuoteRequestStatus(id, status),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["quoteRequests"] });
        toast.success(`Quote request ${variables.status} successfully`);
      },
      onError: (error: any, variables) => {
        toast.error(error.message || `Failed to update quote request to ${variables.status}`);
      }
    });
  };

  /**
   * Hook to delete a quote request
   */
  const useDeleteQuoteRequest = () => {
    return useMutation({
      mutationFn: (id: string) => deleteQuoteRequest(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["quoteRequests"] });
        toast.success("Quote request deleted successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete quote request");
      }
    });
  };

  return {
    useQuoteRequestsList,
    useCreateQuoteRequest,
    useUpdateQuoteRequest,
    useUpdateQuoteRequestStatus,
    useDeleteQuoteRequest
  };
}
