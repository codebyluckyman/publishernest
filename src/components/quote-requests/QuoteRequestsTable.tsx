
import { useState } from 'react';
import { MoreHorizontal, FileEdit, Trash2, ArrowUpDown, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { QuoteRequest, SortQuoteRequestField, SortDirection } from '@/types/quoteRequest';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuoteRequestDialog } from './QuoteRequestDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Organization } from '@/types/organization';
import { useQuoteRequestsApi } from '@/hooks/useQuoteRequestsApi';
import { FormatBadge } from './FormatBadge';
import { AssociatedQuotesDialog } from './AssociatedQuotesDialog';

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

  const handleSort = (field: SortQuoteRequestField) => {
    onSort(field);
  };

  const renderSortIcon = (field: SortQuoteRequestField) => {
    if (field !== sortField) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />;
  };

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'open':
        return <Badge variant="default">Open</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-1 -ml-3 font-medium flex items-center"
                  onClick={() => handleSort('title')}
                >
                  Title {renderSortIcon('title')}
                </Button>
              </TableHead>
              <TableHead>Formats</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-1 -ml-3 font-medium flex items-center"
                  onClick={() => handleSort('status')}
                >
                  Status {renderSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-1 -ml-3 font-medium flex items-center"
                  onClick={() => handleSort('due_date')}
                >
                  Due Date {renderSortIcon('due_date')}
                </Button>
              </TableHead>
              <TableHead>Quotes</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-1 -ml-3 font-medium flex items-center"
                  onClick={() => handleSort('created_at')}
                >
                  Created {renderSortIcon('created_at')}
                </Button>
              </TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quoteRequests.map((quoteRequest) => (
              <TableRow key={quoteRequest.id}>
                <TableCell className="font-medium">{quoteRequest.title}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap">
                    {quoteRequest.formats && quoteRequest.formats.length > 0 ? (
                      quoteRequest.formats.map(format => (
                        <FormatBadge key={format.id} format={format} />
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(quoteRequest.status)}</TableCell>
                <TableCell>{formatDate(quoteRequest.due_date)}</TableCell>
                <TableCell>{quoteRequest.quotes_count || 0}</TableCell>
                <TableCell>{formatDate(quoteRequest.created_at)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => handleViewQuotes(quoteRequest)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        View Quotes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(quoteRequest)}>
                        <FileEdit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(quoteRequest)}
                        className="text-destructive"
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
      {selectedQuoteRequest && isEditDialogOpen && (
        <QuoteRequestDialog
          quoteRequest={selectedQuoteRequest}
          isOpen={isEditDialogOpen}
          onClose={handleEditDialogClose}
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the quote request
              {selectedQuoteRequest?.title && <strong> "{selectedQuoteRequest.title}"</strong>}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
