
import { useState } from "react";
import { 
  Table, 
  TableBody, 
} from "@/components/ui/table";
import { SupplierQuote, SortQuoteField, SortDirection } from "@/types/quote";
import { QuoteDialog } from "./QuoteDialog";
import { Organization } from "@/types/organization";
import { useQuotesApi } from "@/hooks/useQuotesApi";
import { QuoteTableHeader } from "./table/QuoteTableHeader";
import { QuoteTableRow } from "./table/QuoteTableRow";
import { DeleteQuoteDialog } from "./table/DeleteQuoteDialog";
import { ViewQuoteSheet } from "./table/ViewQuoteSheet";
import { useQuoteTableHelpers } from "./table/useQuoteTableHelpers";

interface QuotesTableProps {
  quotes: SupplierQuote[];
  sortField: SortQuoteField;
  sortDirection: SortDirection;
  onSort: (field: SortQuoteField) => void;
  currentOrganization: Organization | null;
}

export const QuotesTable = ({
  quotes,
  sortField,
  sortDirection,
  onSort,
  currentOrganization
}: QuotesTableProps) => {
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  
  const { deleteQuote } = useQuotesApi(currentOrganization);
  const { getStatusBadgeClasses, formatCurrency } = useQuoteTableHelpers();

  const handleViewQuote = (quote: SupplierQuote) => {
    setSelectedQuote(quote);
    setIsViewDialogOpen(true);
  };

  const handleEditQuote = (quote: SupplierQuote) => {
    setSelectedQuote(quote);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (quoteId: string) => {
    setQuoteToDelete(quoteId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (quoteToDelete) {
      await deleteQuote.mutateAsync(quoteToDelete);
      setIsDeleteDialogOpen(false);
      setQuoteToDelete(null);
    }
  };

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <QuoteTableHeader 
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          />
          <TableBody>
            {quotes.map((quote) => (
              <QuoteTableRow
                key={quote.id}
                quote={quote}
                onView={handleViewQuote}
                onEdit={handleEditQuote}
                onDelete={handleDeleteClick}
                getStatusBadgeClasses={getStatusBadgeClasses}
                formatCurrency={formatCurrency}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {selectedQuote && isEditDialogOpen && (
        <QuoteDialog
          quote={selectedQuote}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          currentOrganization={currentOrganization}
        />
      )}

      {/* View Quote Sheet */}
      <ViewQuoteSheet
        selectedQuote={selectedQuote}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        getStatusBadgeClasses={getStatusBadgeClasses}
        formatCurrency={formatCurrency}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteQuoteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </>
  );
};
