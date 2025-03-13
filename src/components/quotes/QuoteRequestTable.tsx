
import { useState, useCallback } from "react";
import { QuoteRequest, QuoteRequestFormValues } from "@/types/quoteRequest";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
import { useSuppliersApi } from "@/hooks/useSuppliersApi";
import { useOrganization } from "@/hooks/useOrganization";
import { QuoteRequestRow } from "./table/QuoteRequestRow";
import { QuoteDetailsSheet } from "./table/QuoteDetailsSheet";
import { EditQuoteRequestDialog } from "./EditQuoteRequestDialog";
import { EmptyState } from "./table/EmptyState";

interface QuoteRequestTableProps {
  quoteRequests: QuoteRequest[];
  isLoading: boolean;
}

export function QuoteRequestTable({ quoteRequests, isLoading }: QuoteRequestTableProps) {
  const { currentOrganization } = useOrganization();
  const { useUpdateQuoteRequestStatus, useDeleteQuoteRequest, useUpdateQuoteRequest } = useQuoteRequests();
  const updateStatusMutation = useUpdateQuoteRequestStatus();
  const deleteMutation = useDeleteQuoteRequest();
  const updateMutation = useUpdateQuoteRequest();
  const { data: suppliers = [] } = useSuppliersApi(currentOrganization);

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

  if (quoteRequests.length === 0) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Supplier(s)</TableHead>
            <TableHead>Date Requested</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Formats</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quoteRequests.map((request) => (
            <QuoteRequestRow
              key={request.id}
              request={request}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onViewDetails={viewDetails}
              onEdit={editRequest}
            />
          ))}
        </TableBody>
      </Table>

      <QuoteDetailsSheet
        isOpen={detailsOpen}
        onOpenChange={closeDetails}
        selectedRequest={selectedRequest}
      />

      <EditQuoteRequestDialog
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        quoteRequest={selectedRequest}
        suppliers={suppliers}
        onSubmit={handleUpdateRequest}
        isSubmitting={updateMutation.isPending}
      />
    </>
  );
}
