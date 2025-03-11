
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
} from '@/components/ui/table';
import { QuoteRequest, SortQuoteRequestField, SortDirection } from '@/types/quoteRequest';
import { QuoteRequestDialog } from './QuoteRequestDialog';
import { Organization } from '@/types/organization';
import { useQuoteRequestsApi } from '@/hooks/quote-requests/useQuoteRequestsApi';
import { AssociatedQuotesDialog } from './AssociatedQuotesDialog';
import { QuoteRequestTableHeader } from './table/QuoteRequestTableHeader';
import { QuoteRequestTableRow } from './table/QuoteRequestTableRow';
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isQuotesDialogOpen, setIsQuotesDialogOpen] = useState(false);
  const [selectedQuoteRequest, setSelectedQuoteRequest] = useState<QuoteRequest | null>(null);
  
  const { deleteQuoteRequest, refetch } = useQuoteRequestsApi(currentOrganization);

  const handleEdit = (quoteRequest: QuoteRequest) => {
    setSelectedQuoteRequest(quoteRequest);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (quoteRequest: QuoteRequest) => {
    setSelectedQuoteRequest(quoteRequest);
    setIsDeleteDialogOpen(true);
  };

  const handleViewQuotes = (quoteRequest: QuoteRequest) => {
    setSelectedQuoteRequest(quoteRequest);
    setIsQuotesDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    // Allow time for the dialog to close properly before clearing selection
    setTimeout(() => {
      setSelectedQuoteRequest(null);
      refetch();
    }, 300);
  };

  const handleQuotesDialogClose = () => {
    setIsQuotesDialogOpen(false);
    // Allow time for the dialog to close properly before clearing selection
    setTimeout(() => {
      setSelectedQuoteRequest(null);
    }, 300);
  };

  const confirmDelete = async () => {
    if (selectedQuoteRequest) {
      await deleteQuoteRequest.mutateAsync(selectedQuoteRequest.id);
      setIsDeleteDialogOpen(false);
      setSelectedQuoteRequest(null);
    }
  };

  return (
    <>
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
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewQuotes={handleViewQuotes}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {selectedQuoteRequest && isEditDialogOpen && (
        <QuoteRequestDialog
          quoteRequest={selectedQuoteRequest}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          currentOrganization={currentOrganization}
        />
      )}

      {/* Associated Quotes Dialog */}
      {selectedQuoteRequest && isQuotesDialogOpen && (
        <AssociatedQuotesDialog
          quoteRequest={selectedQuoteRequest}
          isOpen={isQuotesDialogOpen}
          onClose={handleQuotesDialogClose}
          currentOrganization={currentOrganization}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteQuoteRequestDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        quoteRequest={selectedQuoteRequest}
      />
    </>
  );
}
