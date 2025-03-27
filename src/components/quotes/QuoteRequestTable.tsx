
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
import { BulkDueDateDialog } from "./table/BulkDueDateDialog";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePagination, PageSize } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface QuoteRequestTableProps {
  quoteRequests: QuoteRequest[];
  isLoading: boolean;
}

export function QuoteRequestTable({ quoteRequests, isLoading }: QuoteRequestTableProps) {
  const { currentOrganization } = useOrganization();
  const { data: suppliers = [] } = useSuppliersApi(currentOrganization);
  const navigate = useNavigate();
  
  // Sort functionality
  const { sortField, sortDirection, handleSort, sortedQuoteRequests } = useQuoteRequestSort(quoteRequests);
  
  // Pagination functionality
  const {
    currentData: paginatedQuoteRequests,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
  } = usePagination<QuoteRequest>({
    data: sortedQuoteRequests,
    initialPageSize: 10,
  });
  
  // Get all quote request IDs for bulk operations
  const allQuoteRequestIds = useMemo(() => quoteRequests.map(req => req.id), [quoteRequests]);
  
  // Request management (view, edit, delete, etc.)
  const {
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
  } = useQuoteRequestManagement();

  // Function to navigate to supplier quotes for a specific quote request
  const handleViewSupplierQuotes = (request: QuoteRequest) => {
    navigate(`/quotes?quoteRequestId=${request.id}&tab=all`);
  };

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
        onUpdateDueDate={openDueDateDialog}
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
          {paginatedQuoteRequests.map((request) => (
            <QuoteRequestRow
              key={request.id}
              request={request}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onViewDetails={viewDetails}
              onEdit={editRequest}
              onViewSupplierQuotes={handleViewSupplierQuotes}
              isSelected={selectedRows.includes(request.id)}
              onSelectRow={handleSelectRow}
            />
          ))}
        </TableBody>
      </Table>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={goToPage}
        onPreviousPage={previousPage}
        onNextPage={nextPage}
        onPageSizeChange={changePageSize}
      />

      <QuoteDetailsSheet
        isOpen={detailsOpen}
        onOpenChange={closeDetails}
        selectedRequest={selectedRequest}
        onEdit={editRequest}
        onStatusChange={handleStatusChange}
      />

      <EditQuoteRequestDialog
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        quoteRequest={selectedRequest}
        suppliers={suppliers}
        onSubmit={handleUpdateRequest}
        isSubmitting={updateMutation.isPending}
      />

      <BulkDueDateDialog
        isOpen={dueDateDialogOpen}
        onOpenChange={setDueDateDialogOpen}
        onConfirm={handleBulkUpdateDueDate}
        count={selectedRows.length}
      />
    </>
  );
}
