
import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Trash2, EyeIcon, FileText } from "lucide-react";
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
import { QuoteRequest, SortQuoteRequestField, SortDirection } from "@/types/quoteRequest";
import { format } from "date-fns";
import { QuoteRequestDialog } from "./QuoteRequestDialog";
import { Organization } from "@/types/organization";
import { useQuoteRequestsApi } from "@/hooks/useQuoteRequestsApi";
import { useNavigate } from "react-router-dom";

interface QuoteRequestsTableProps {
  quoteRequests: QuoteRequest[];
  sortField: SortQuoteRequestField;
  sortDirection: SortDirection;
  onSort: (field: SortQuoteRequestField) => void;
  currentOrganization: Organization | null;
}

export const QuoteRequestsTable = ({
  quoteRequests,
  sortField,
  sortDirection,
  onSort,
  currentOrganization
}: QuoteRequestsTableProps) => {
  const [selectedQuoteRequest, setSelectedQuoteRequest] = useState<QuoteRequest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [quoteRequestToDelete, setQuoteRequestToDelete] = useState<string | null>(null);
  
  const { deleteQuoteRequest } = useQuoteRequestsApi(currentOrganization);
  const navigate = useNavigate();

  const handleSort = (field: SortQuoteRequestField) => {
    onSort(field);
  };

  const SortIcon = ({ field }: { field: SortQuoteRequestField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />;
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEditQuoteRequest = (quoteRequest: QuoteRequest) => {
    setSelectedQuoteRequest(quoteRequest);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (quoteRequestId: string) => {
    setQuoteRequestToDelete(quoteRequestId);
    setIsDeleteDialogOpen(true);
  };

  const handleViewQuotes = (quoteRequestId: string) => {
    navigate(`/quotes?requestId=${quoteRequestId}`);
  };

  const confirmDelete = async () => {
    if (quoteRequestToDelete) {
      await deleteQuoteRequest.mutateAsync(quoteRequestToDelete);
      setIsDeleteDialogOpen(false);
      setQuoteRequestToDelete(null);
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
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center">
                  Title
                  <SortIcon field="title" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center">
                  Created
                  <SortIcon field="created_at" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('due_date')}
              >
                <div className="flex items-center">
                  Due Date
                  <SortIcon field="due_date" />
                </div>
              </TableHead>
              <TableHead>Quotes</TableHead>
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
            {quoteRequests.map((quoteRequest) => (
              <TableRow key={quoteRequest.id}>
                <TableCell className="font-medium">{quoteRequest.title}</TableCell>
                <TableCell>
                  {quoteRequest.created_at ? format(new Date(quoteRequest.created_at), 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell>
                  {quoteRequest.due_date ? format(new Date(quoteRequest.due_date), 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell>{quoteRequest.quotes_count || 0}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClasses(quoteRequest.status)}`}>
                    {quoteRequest.status.charAt(0).toUpperCase() + quoteRequest.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <span className="sr-only">Open menu</span>
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewQuotes(quoteRequest.id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Quotes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditQuoteRequest(quoteRequest)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Request
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteClick(quoteRequest.id)}
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
      {selectedQuoteRequest && (
        <QuoteRequestDialog
          quoteRequest={selectedQuoteRequest}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedQuoteRequest(null);
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
              This action cannot be undone. This will permanently delete the quote request and may affect associated quotes.
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
