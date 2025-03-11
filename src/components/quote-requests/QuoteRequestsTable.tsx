
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
} from '@/components/ui/table';
import { QuoteRequest, SortQuoteRequestField, SortDirection } from '@/types/quoteRequest';
import { Organization } from '@/types/organization';
import { useQuoteRequestsApi } from '@/hooks/quote-requests/useQuoteRequestsApi';
import { QuoteRequestTableHeader } from './table/QuoteRequestTableHeader';
import { QuoteRequestTableRow } from './table/QuoteRequestTableRow';
import { ViewQuoteRequestSheet } from './table/ViewQuoteRequestSheet';
import { QuoteRequestDialog } from './QuoteRequestDialog';
import { DeleteQuoteRequestDialog } from './table/DeleteQuoteRequestDialog';

interface QuoteRequestsTableProps {
  quoteRequests: QuoteRequest[];
  sortField: SortQuoteRequestField;
  sortDirection: SortDirection;
  onSort: (field: SortQuoteRequestField) => void;
  currentOrganization: Organization | null;
}

export function QuoteRequestsTable({ 
  quoteRequests, 
  sortField, 
  sortDirection, 
  onSort,
  currentOrganization
}: QuoteRequestsTableProps) {
  const { refetch, deleteQuoteRequest } = useQuoteRequestsApi(currentOrganization);
  const [selectedQuoteRequest, setSelectedQuoteRequest] = useState<QuoteRequest | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSelectQuoteRequest = (quoteRequest: QuoteRequest) => {
    setSelectedQuoteRequest(quoteRequest);
    setSheetOpen(true);
  };

  const handleEditQuoteRequest = (quoteRequest: QuoteRequest) => {
    setSelectedQuoteRequest(quoteRequest);
    setEditDialogOpen(true);
  };

  const handleDeleteQuoteRequest = (quoteRequest: QuoteRequest) => {
    setSelectedQuoteRequest(quoteRequest);
    setDeleteDialogOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      // Refresh data when sheet is closed to get any updates
      refetch();
    }
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      refetch();
    }
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      refetch();
    }
  };

  const confirmDelete = async () => {
    if (selectedQuoteRequest) {
      await deleteQuoteRequest.mutateAsync(selectedQuoteRequest.id);
      setDeleteDialogOpen(false);
      refetch();
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <QuoteRequestTableHeader 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        <TableBody>
          {quoteRequests.map((quoteRequest) => (
            <QuoteRequestTableRow
              key={quoteRequest.id}
              quoteRequest={quoteRequest}
              onSelect={handleSelectQuoteRequest}
              onEdit={handleEditQuoteRequest}
              onDelete={handleDeleteQuoteRequest}
            />
          ))}
        </TableBody>
      </Table>

      <ViewQuoteRequestSheet
        quoteRequest={selectedQuoteRequest}
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
      />

      {selectedQuoteRequest && (
        <>
          <QuoteRequestDialog
            quoteRequest={selectedQuoteRequest}
            open={editDialogOpen}
            onOpenChange={handleEditDialogOpenChange}
            currentOrganization={currentOrganization}
          />

          <DeleteQuoteRequestDialog
            open={deleteDialogOpen}
            onOpenChange={handleDeleteDialogOpenChange}
            onConfirmDelete={confirmDelete}
            isDeleting={deleteQuoteRequest.isPending}
          />
        </>
      )}
    </div>
  );
}
