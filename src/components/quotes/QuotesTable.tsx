
import { useState } from "react";
import { MoreHorizontal, ChevronDown, ChevronUp, Edit, Trash2, EyeIcon, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SupplierQuote, SortQuoteField, SortDirection } from "@/types/quote";
import { format } from "date-fns";
import { QuoteDialog } from "./QuoteDialog";
import { Organization } from "@/types/organization";
import { useQuotesApi } from "@/hooks/useQuotesApi";
import { Badge } from "@/components/ui/badge";

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

  const handleSort = (field: SortQuoteField) => {
    onSort(field);
  };

  const SortIcon = ({ field }: { field: SortQuoteField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />;
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null) return '-';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

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
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('supplier_name')}
              >
                <div className="flex items-center">
                  Supplier
                  <SortIcon field="supplier_name" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('quote_date')}
              >
                <div className="flex items-center">
                  Quote Date
                  <SortIcon field="quote_date" />
                </div>
              </TableHead>
              <TableHead>Quote #</TableHead>
              <TableHead>Quote Request</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('total_amount')}
              >
                <div className="flex items-center">
                  Amount
                  <SortIcon field="total_amount" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  <SortIcon field="status" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.supplier_name}</TableCell>
                <TableCell>
                  {quote.quote_date ? format(new Date(quote.quote_date), 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell>{quote.quote_number || '-'}</TableCell>
                <TableCell>
                  {quote.quote_request_id ? (
                    <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
                      <Link className="h-3 w-3" />
                      {quote.quote_request?.title || quote.quote_request_id}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {formatCurrency(quote.total_amount, quote.currency_code)}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClasses(quote.status)}`}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewQuote(quote)}>
                        <EyeIcon className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditQuote(quote)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Quote
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteClick(quote.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {selectedQuote && (
        <QuoteDialog
          quote={selectedQuote}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedQuote(null);
          }}
          currentOrganization={currentOrganization}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier quote and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
