
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
  deleteQuoteRequest,
  fetchQuoteRequestAudit
} from "@/api/quoteRequests";

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
      meta: {
        onError: (error: any) => {
          toast.error(error.message || "Failed to load quote requests");
        }
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
      mutationFn: ({ id, updates }: { id: string; updates: Partial<QuoteRequestFormValues> }) => {
        if (!user) {
          throw new Error("User not authenticated");
        }
        return updateQuoteRequest(id, updates, user.id);
      },
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
      mutationFn: ({ id, status }: { id: string; status: 'pending' | 'approved' | 'declined' }) => {
        if (!user) {
          throw new Error("User not authenticated");
        }
        return updateQuoteRequestStatus(id, status, user.id);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["quoteRequests"] });
        const statusMessage = variables.status === 'approved' 
          ? 'marked active' 
          : variables.status === 'declined' 
            ? 'marked inactive' 
            : 'marked as pending';
        toast.success(`Quote request ${statusMessage} successfully`);
      },
      onError: (error: any, variables) => {
        const statusText = variables.status === 'approved' 
          ? 'mark active' 
          : variables.status === 'declined' 
            ? 'mark inactive' 
            : 'mark as pending';
        toast.error(error.message || `Failed to ${statusText} quote request`);
      }
    });
  };

  /**
   * Hook to delete a quote request
   */
  const useDeleteQuoteRequest = () => {
    return useMutation({
      mutationFn: (id: string) => {
        if (!user) {
          throw new Error("User not authenticated");
        }
        return deleteQuoteRequest(id, user.id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["quoteRequests"] });
        toast.success("Quote request deleted successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete quote request");
      }
    });
  };

  /**
   * Hook to fetch audit history for a quote request
   */
  const useQuoteRequestAudit = (quoteRequestId: string | null) => {
    return useQuery({
      queryKey: ["quoteRequestAudit", quoteRequestId],
      queryFn: () => fetchQuoteRequestAudit(quoteRequestId as string),
      enabled: !!quoteRequestId,
      meta: {
        onError: (error: any) => {
          toast.error(error.message || "Failed to load audit history");
        }
      }
    });
  };

  return {
    useQuoteRequestsList,
    useCreateQuoteRequest,
    useUpdateQuoteRequest,
    useUpdateQuoteRequestStatus,
    useDeleteQuoteRequest,
    useQuoteRequestAudit
  };
}
