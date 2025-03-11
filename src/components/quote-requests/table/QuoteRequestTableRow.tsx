
import { format } from "date-fns";
import { QuoteRequest } from '@/types/quoteRequest';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormatBadge } from '../FormatBadge';
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash } from "lucide-react";

interface QuoteRequestTableRowProps {
  quoteRequest: QuoteRequest;
  onSelect: (quoteRequest: QuoteRequest) => void;
  onEdit: (quoteRequest: QuoteRequest) => void;
  onDelete: (quoteRequest: QuoteRequest) => void;
}

export const QuoteRequestTableRow = ({
  quoteRequest,
  onSelect,
  onEdit,
  onDelete
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
    <TableRow key={quoteRequest.id} className="hover:bg-muted/50">
      <TableCell 
        className="font-medium cursor-pointer" 
        onClick={() => onSelect(quoteRequest)}
      >
        {quoteRequest.title}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
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
        <div className="flex items-center justify-end space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              onSelect(quoteRequest);
            }}
            title="View quote request"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(quoteRequest);
            }}
            title="Edit quote request"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(quoteRequest);
            }}
            title="Delete quote request"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
