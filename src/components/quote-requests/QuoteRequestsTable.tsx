
import { useState } from 'react';
import { MoreHorizontal, FileEdit, Trash2 } from 'lucide-react';
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
  const [selectedQuoteRequest, setSelectedQuoteRequest] = useState<QuoteRequest | null>(null);
  
  const { deleteQuoteRequest } = useQuoteRequestsApi(currentOrganization);

  const getSortIcon = (field: SortQuoteRequestField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleEdit = (quoteRequest: QuoteRequest) => {
    setSelectedQuoteRequest(quoteRequest);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (quoteRequest: QuoteRequest) => {
    setSelectedQuoteRequest(quoteRequest);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedQuoteRequest) {
      await deleteQuoteRequest.mutateAsync(selectedQuoteRequest.id);
      setIsDeleteDialogOpen(false);
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[25%] cursor-pointer"
                onClick={() => onSort('title')}
              >
                Title {getSortIcon('title')}
              </TableHead>
              <TableHead>Formats</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSort('status')}
              >
                Status {getSortIcon('status')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSort('due_date')}
              >
                Due Date {getSortIcon('due_date')}
              </TableHead>
              <TableHead>Quotes</TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => onSort('created_at')}
              >
                Created {getSortIcon('created_at')}
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
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
                <TableCell className="text-right">{formatDate(quoteRequest.created_at)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
      {selectedQuoteRequest && (
        <QuoteRequestDialog
          quoteRequest={selectedQuoteRequest}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
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
