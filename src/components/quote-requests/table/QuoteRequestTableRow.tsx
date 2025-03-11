
import { format } from "date-fns";
import { MoreHorizontal, FileEdit, Trash2, MessageSquare } from 'lucide-react';
import { QuoteRequest } from '@/types/quoteRequest';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { FormatBadge } from '../FormatBadge';

interface QuoteRequestTableRowProps {
  quoteRequest: QuoteRequest;
  onEdit: (quoteRequest: QuoteRequest) => void;
  onDelete: (quoteRequest: QuoteRequest) => void;
  onViewQuotes: (quoteRequest: QuoteRequest) => void;
}

export const QuoteRequestTableRow = ({
  quoteRequest,
  onEdit,
  onDelete,
  onViewQuotes
}: QuoteRequestTableRowProps) => {
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
            <DropdownMenuItem onClick={() => onViewQuotes(quoteRequest)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              View Quotes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(quoteRequest)}>
              <FileEdit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(quoteRequest)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
