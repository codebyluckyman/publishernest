
import { useState, useCallback } from "react";
import { QuoteRequest, QuoteRequestFormValues } from "@/types/quoteRequest";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";

export function useQuoteRequestManagement() {
  const { useUpdateQuoteRequestStatus, useDeleteQuoteRequest, useUpdateQuoteRequest } = useQuoteRequests();
  const updateStatusMutation = useUpdateQuoteRequestStatus();
  const deleteMutation = useDeleteQuoteRequest();
  const updateMutation = useUpdateQuoteRequest();

  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleStatusChange = useCallback((id: string, status: 'approved' | 'declined' | 'pending') => {
    updateStatusMutation.mutate({ id, status });
  }, [updateStatusMutation]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this quote request?")) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const viewDetails = useCallback((request: QuoteRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  }, []);

  const editRequest = useCallback((request: QuoteRequest) => {
    setSelectedRequest(request);
    setEditOpen(true);
  }, []);

  const handleUpdateRequest = useCallback((id: string, data: QuoteRequestFormValues) => {
    updateMutation.mutate(
      { id, updates: data },
      {
        onSuccess: () => {
          setEditOpen(false);
        }
      }
    );
  }, [updateMutation]);

  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
    setTimeout(() => {
      setSelectedRequest(null);
    }, 300);
  }, []);

  return {
    selectedRequest,
    detailsOpen,
    editOpen,
    setEditOpen,
    handleStatusChange,
    handleDelete,
    viewDetails,
    editRequest,
    handleUpdateRequest,
    closeDetails,
    updateMutation
  };
}
