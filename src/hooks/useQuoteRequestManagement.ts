import { useState, useCallback, useMemo } from "react";
import { QuoteRequest, QuoteRequestFormValues } from "@/types/quoteRequest";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
import { toast } from "sonner";

export function useQuoteRequestManagement() {
  const { useUpdateQuoteRequestStatus, useDeleteQuoteRequest, useUpdateQuoteRequest } = useQuoteRequests();
  const updateStatusMutation = useUpdateQuoteRequestStatus();
  const deleteMutation = useDeleteQuoteRequest();
  const updateMutation = useUpdateQuoteRequest();

  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dueDateDialogOpen, setDueDateDialogOpen] = useState(false);

  const handleSelectRow = useCallback((id: string, selected: boolean) => {
    setSelectedRows(prev => 
      selected 
        ? [...prev, id] 
        : prev.filter(rowId => rowId !== id)
    );
  }, []);

  const handleSelectAll = useCallback((selected: boolean, allIds: string[]) => {
    setSelectedRows(selected ? [...allIds] : []);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRows([]);
  }, []);

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

  const handleBulkStatusChange = useCallback((status: 'approved' | 'declined' | 'pending') => {
    if (selectedRows.length === 0) return;

    const statusText = status === 'approved' ? 'approve' : status === 'declined' ? 'decline' : 'mark as pending';
    const confirmMessage = `Are you sure you want to ${statusText} ${selectedRows.length} quote request${selectedRows.length > 1 ? 's' : ''}?`;
    
    if (window.confirm(confirmMessage)) {
      const promises = selectedRows.map(id => 
        updateStatusMutation.mutateAsync({ id, status })
      );
      
      Promise.all(promises)
        .then(() => {
          toast.success(`Successfully updated ${selectedRows.length} quote request${selectedRows.length > 1 ? 's' : ''}`);
          clearSelection();
        })
        .catch(error => {
          toast.error(`Error updating some quote requests: ${error.message}`);
        });
    }
  }, [selectedRows, updateStatusMutation, clearSelection]);

  const handleBulkDelete = useCallback(() => {
    if (selectedRows.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedRows.length} quote request${selectedRows.length > 1 ? 's' : ''}?`;
    
    if (window.confirm(confirmMessage)) {
      const promises = selectedRows.map(id => 
        deleteMutation.mutateAsync(id)
      );
      
      Promise.all(promises)
        .then(() => {
          toast.success(`Successfully deleted ${selectedRows.length} quote request${selectedRows.length > 1 ? 's' : ''}`);
          clearSelection();
        })
        .catch(error => {
          toast.error(`Error deleting some quote requests: ${error.message}`);
        });
    }
  }, [selectedRows, deleteMutation, clearSelection]);

  const openDueDateDialog = useCallback(() => {
    setDueDateDialogOpen(true);
  }, []);

  const handleBulkUpdateDueDate = useCallback((newDate: Date | undefined) => {
    if (selectedRows.length === 0) return;

    const action = newDate ? "update" : "remove";
    
    const promises = selectedRows.map(id => 
      updateMutation.mutateAsync({ 
        id, 
        updates: { due_date: newDate } 
      })
    );
    
    Promise.all(promises)
      .then(() => {
        toast.success(`Successfully ${action}d due date for ${selectedRows.length} quote request${selectedRows.length > 1 ? 's' : ''}`);
        clearSelection();
      })
      .catch(error => {
        toast.error(`Error updating due dates: ${error.message}`);
      });
  }, [selectedRows, updateMutation, clearSelection]);

  return {
    selectedRequest,
    detailsOpen,
    editOpen,
    setEditOpen,
    selectedRows,
    dueDateDialogOpen,
    setDueDateDialogOpen,
    handleSelectRow,
    handleSelectAll,
    clearSelection,
    handleStatusChange,
    handleDelete,
    viewDetails,
    editRequest,
    handleUpdateRequest,
    closeDetails,
    updateMutation,
    handleBulkStatusChange,
    handleBulkDelete,
    openDueDateDialog,
    handleBulkUpdateDueDate
  };
}
