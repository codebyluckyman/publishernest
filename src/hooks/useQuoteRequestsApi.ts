
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Organization } from "@/types/organization";
import { QuoteRequest, QuoteRequestFormValues } from "@/types/quoteRequest";
import { useAuth } from "@/context/AuthContext";

export function useQuoteRequestsApi() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all quote requests
  const fetchQuoteRequests = async (
    params: {
      currentOrganization: Organization | null;
      status?: string;
      searchQuery?: string;
    }
  ): Promise<QuoteRequest[]> => {
    const { currentOrganization, status, searchQuery } = params;

    if (!currentOrganization) {
      return [];
    }

    try {
      let query = supabase
        .from("quote_requests")
        .select(`
          *,
          suppliers:supplier_id (supplier_name),
          quote_request_formats(
            id,
            format_id,
            quantity,
            notes,
            formats:format_id(format_name)
          )
        `)
        .eq("organization_id", currentOrganization.id);

      if (status && status !== 'all') {
        query = query.eq("status", status);
      }

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      query = query.order("requested_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to include supplier_name directly and format the formats array
      return (data || []).map(item => ({
        ...item,
        supplier_name: item.suppliers?.supplier_name || 'Unknown',
        formats: item.quote_request_formats?.map(f => ({
          ...f,
          format_name: f.formats?.format_name
        })) || []
      })) as QuoteRequest[];
    } catch (error: any) {
      console.error("Error fetching quote requests:", error);
      toast.error("Failed to load quote requests");
      return [];
    }
  };

  // Create a new quote request
  const createQuoteRequest = async (
    formData: QuoteRequestFormValues,
    organizationId: string
  ): Promise<QuoteRequest | null> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const newQuoteRequest = {
        organization_id: organizationId,
        supplier_id: formData.supplier_id,
        title: formData.title,
        description: formData.description || null,
        status: "pending",
        requested_by: user.id,
        expected_delivery_date: formData.expected_delivery_date || null,
        products: formData.products || null,
        quantities: formData.quantities || null,
        notes: formData.notes || null
      };

      // Insert the quote request
      const { data: quoteRequestData, error: quoteRequestError } = await supabase
        .from("quote_requests")
        .insert(newQuoteRequest)
        .select()
        .single();

      if (quoteRequestError) throw quoteRequestError;

      // If formats were provided, insert them
      if (formData.formats && formData.formats.length > 0 && quoteRequestData) {
        const formatEntries = formData.formats.map(format => ({
          quote_request_id: quoteRequestData.id,
          format_id: format.format_id,
          quantity: format.quantity,
          notes: format.notes || null
        }));

        const { error: formatsError } = await supabase
          .from("quote_request_formats")
          .insert(formatEntries);

        if (formatsError) {
          console.error("Error inserting formats:", formatsError);
          toast.error("Quote request created but formats couldn't be added");
        }
      }

      toast.success("Quote request created successfully");
      return quoteRequestData as QuoteRequest;
    } catch (error: any) {
      console.error("Error creating quote request:", error);
      toast.error(error.message || "Failed to create quote request");
      return null;
    }
  };

  // Update a quote request
  const updateQuoteRequest = async (
    id: string,
    updates: Partial<QuoteRequestFormValues>
  ): Promise<QuoteRequest | null> => {
    try {
      const { data, error } = await supabase
        .from("quote_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast.success("Quote request updated successfully");
      return data as QuoteRequest;
    } catch (error: any) {
      console.error("Error updating quote request:", error);
      toast.error(error.message || "Failed to update quote request");
      return null;
    }
  };

  // Update status of a quote request
  const updateQuoteRequestStatus = async (
    id: string,
    status: 'pending' | 'approved' | 'declined'
  ): Promise<QuoteRequest | null> => {
    try {
      const { data, error } = await supabase
        .from("quote_requests")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Quote request ${status} successfully`);
      return data as QuoteRequest;
    } catch (error: any) {
      console.error("Error updating quote request status:", error);
      toast.error(error.message || `Failed to update quote request to ${status}`);
      return null;
    }
  };

  // Delete a quote request
  const deleteQuoteRequest = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("quote_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Quote request deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting quote request:", error);
      toast.error(error.message || "Failed to delete quote request");
      return false;
    }
  };

  // Hooks
  const useQuoteRequests = (
    currentOrganization: Organization | null,
    status?: string,
    searchQuery?: string
  ) => {
    return useQuery({
      queryKey: ["quoteRequests", currentOrganization?.id, status, searchQuery],
      queryFn: () => fetchQuoteRequests({ currentOrganization, status, searchQuery }),
      enabled: !!currentOrganization
    });
  };

  const useCreateQuoteRequest = () => {
    return useMutation({
      mutationFn: ({ formData, organizationId }: { formData: QuoteRequestFormValues; organizationId: string }) =>
        createQuoteRequest(formData, organizationId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["quoteRequests"] });
      }
    });
  };

  const useUpdateQuoteRequest = () => {
    return useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: Partial<QuoteRequestFormValues> }) =>
        updateQuoteRequest(id, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["quoteRequests"] });
      }
    });
  };

  const useUpdateQuoteRequestStatus = () => {
    return useMutation({
      mutationFn: ({ id, status }: { id: string; status: 'pending' | 'approved' | 'declined' }) =>
        updateQuoteRequestStatus(id, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["quoteRequests"] });
      }
    });
  };

  const useDeleteQuoteRequest = () => {
    return useMutation({
      mutationFn: (id: string) => deleteQuoteRequest(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["quoteRequests"] });
      }
    });
  };

  return {
    // Raw functions
    fetchQuoteRequests,
    createQuoteRequest,
    updateQuoteRequest,
    updateQuoteRequestStatus,
    deleteQuoteRequest,
    
    // React Query hooks
    useQuoteRequests,
    useCreateQuoteRequest,
    useUpdateQuoteRequest,
    useUpdateQuoteRequestStatus,
    useDeleteQuoteRequest
  };
}
