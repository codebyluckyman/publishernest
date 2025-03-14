
import { QuoteRequest } from "@/types/quoteRequest";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { useSuppliersApi } from "@/hooks/useSuppliersApi";
import { useOrganization } from "@/hooks/useOrganization";
import { QuoteRequestRow } from "./table/QuoteRequestRow";
import { QuoteDetailsSheet } from "./table/QuoteDetailsSheet";
import { EditQuoteRequestDialog } from "./EditQuoteRequestDialog";
import { EmptyState } from "./table/EmptyState";
import { useQuoteRequestSort } from "@/hooks/useQuoteRequestSort";
import { useQuoteRequestManagement } from "@/hooks/useQuoteRequestManagement";
import { QuoteRequestTableHeader } from "./table/QuoteRequestTableHeader";
import { BulkActions } from "./table/BulkActions";
import { useMemo } from "react";

interface QuoteRequestTableProps {
  quoteRequests: QuoteRequest[];
  isLoading: boolean;
}

export function QuoteRequestTable({ quoteRequests, isLoading }: QuoteRequestTableProps) {
  const { currentOrganization } = useOrganization();
  const { data: suppliers = [] } = useSuppliersApi(currentOrganization);
  
  // Sort functionality
  const { sortField, sortDirection, handleSort, sortedQuoteRequests } = useQuoteRequestSort(quoteRequests);
  
  // Get all quote request IDs for bulk operations
  const allQuoteRequestIds = useMemo(() => quoteRequests.map(req => req.id), [quoteRequests]);
  
  // Request management (view, edit, delete, etc.)
  const {
    selectedRequest,
    detailsOpen,
    editOpen,
    setEditOpen,
    selectedRows,
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
    handleBulkDelete
  } = useQuoteRequestManagement();

  if (quoteRequests.length === 0) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      <BulkActions 
        selectedCount={selectedRows.length}
        onApprove={() => handleBulkStatusChange('approved')}
        onDecline={() => handleBulkStatusChange('declined')}
        onMarkPending={() => handleBulkStatusChange('pending')}
        onDelete={handleBulkDelete}
        onClearSelection={clearSelection}
      />

      <Table>
        <QuoteRequestTableHeader
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          selectedRows={selectedRows}
          allRowIds={allQuoteRequestIds}
          onSelectAll={(selected) => handleSelectAll(selected, allQuoteRequestIds)}
        />
        <TableBody>
          {sortedQuoteRequests.map((request) => (
            <QuoteRequestRow
              key={request.id}
              request={request}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onViewDetails={viewDetails}
              onEdit={editRequest}
              isSelected={selectedRows.includes(request.id)}
              onSelectRow={handleSelectRow}
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
