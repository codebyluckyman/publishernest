
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Organization } from "@/types/organization";
import { SupplierQuote, SupplierQuoteFormValues, SupplierQuoteStatus } from "@/types/supplierQuote";
import { useAuth } from "@/context/AuthContext";
import {
  fetchSupplierQuotes,
  fetchSupplierQuoteById,
  createSupplierQuote,
  updateSupplierQuote,
  submitSupplierQuote,
  fetchSupplierQuoteAudit,
  acceptSupplierQuote,
  declineSupplierQuote
} from "@/api/supplierQuotes";

/**
 * Custom hook for managing supplier quotes with React Query
 */
export function useSupplierQuotes() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /**
   * Hook to fetch supplier quotes
   */
  const useSupplierQuotesList = (
    currentOrganization: Organization | null,
    status?: string,
    supplierId?: string,
    quoteRequestId?: string,
    searchQuery?: string
  ) => {
    return useQuery({
      queryKey: ["supplierQuotes", currentOrganization?.id, status, supplierId, quoteRequestId, searchQuery],
      queryFn: () => fetchSupplierQuotes({
        currentOrganization,
        status,
        supplierId,
        quoteRequestId,
        searchQuery
      }),
      enabled: !!currentOrganization,
      meta: {
        onError: (error: any) => {
          toast.error(error.message || "Failed to load supplier quotes");
        }
      }
    });
  };

  /**
   * Hook to fetch a specific supplier quote by ID
   */
  const useSupplierQuoteById = (id: string | null) => {
    return useQuery({
      queryKey: ["supplierQuote", id],
      queryFn: () => fetchSupplierQuoteById(id as string),
      enabled: !!id,
      meta: {
        onError: (error: any) => {
          toast.error(error.message || "Failed to load supplier quote");
        }
      }
    });
  };

  /**
   * Hook to create a new supplier quote
   */
  const useCreateSupplierQuote = () => {
    return useMutation({
      mutationFn: ({ formData, organizationId }: { formData: SupplierQuoteFormValues; organizationId: string }) => {
        if (!user) {
          throw new Error("User not authenticated");
        }
        return createSupplierQuote(formData, organizationId, user.id);
      },
      onSuccess: (quoteId) => {
        queryClient.invalidateQueries({ queryKey: ["supplierQuotes"] });
        toast.success("Supplier quote created successfully");
        return quoteId; // Return the quote ID
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create supplier quote");
      }
    });
  };

  /**
   * Hook to update a supplier quote
   */
  const useUpdateSupplierQuote = () => {
    return useMutation({
      mutationFn: ({ id, updates, previousData }: { id: string; updates: Partial<SupplierQuoteFormValues>; previousData?: any }) => {
        if (!user) {
          throw new Error("User not authenticated");
        }
        return updateSupplierQuote(id, updates, user.id, previousData);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["supplierQuotes"] });
        queryClient.invalidateQueries({ queryKey: ["supplierQuote", variables.id] });
        toast.success("Supplier quote updated successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update supplier quote");
      }
    });
  };

  /**
   * Hook to submit a supplier quote
   */
  const useSubmitSupplierQuote = () => {
    return useMutation({
      mutationFn: ({ id, totalCost }: { id: string; totalCost: number }) => {
        if (!user) {
          throw new Error("User not authenticated");
        }
        return submitSupplierQuote(id, totalCost, user.id);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["supplierQuotes"] });
        queryClient.invalidateQueries({ queryKey: ["supplierQuote", variables.id] });
        toast.success("Supplier quote submitted successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to submit supplier quote");
      }
    });
  };

  /**
   * Hook to accept a supplier quote
   */
  const useAcceptSupplierQuote = () => {
    return useMutation({
      mutationFn: ({ id, acceptedCost }: { id: string; acceptedCost: number }) => {
        if (!user) {
          throw new Error("User not authenticated");
        }
        return acceptSupplierQuote(id, acceptedCost, user.id);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["supplierQuotes"] });
        queryClient.invalidateQueries({ queryKey: ["supplierQuote", variables.id] });
        toast.success("Supplier quote accepted successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to accept supplier quote");
      }
    });
  };

  /**
   * Hook to decline a supplier quote
   */
  const useDeclineSupplierQuote = () => {
    return useMutation({
      mutationFn: ({ id, reason }: { id: string; reason?: string }) => {
        if (!user) {
          throw new Error("User not authenticated");
        }
        return declineSupplierQuote(id, user.id, reason);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["supplierQuotes"] });
        queryClient.invalidateQueries({ queryKey: ["supplierQuote", variables.id] });
        toast.success("Supplier quote declined successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to decline supplier quote");
      }
    });
  };

  /**
   * Hook to fetch supplier quote audit
   */
  const useSupplierQuoteAudit = (supplierQuoteId: string | null) => {
    return useQuery({
      queryKey: ['supplier-quote-audit', supplierQuoteId],
      queryFn: async () => {
        if (!supplierQuoteId) return [];
        return fetchSupplierQuoteAudit(supplierQuoteId);
      },
      enabled: !!supplierQuoteId
    });
  };

  return {
    useSupplierQuotesList,
    useSupplierQuoteById,
    useCreateSupplierQuote,
    useUpdateSupplierQuote,
    useSubmitSupplierQuote,
    useAcceptSupplierQuote,
    useDeclineSupplierQuote,
    useSupplierQuoteAudit
  };
}
