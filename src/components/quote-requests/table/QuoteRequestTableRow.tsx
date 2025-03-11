
import { format } from "date-fns";
import { QuoteRequest } from '@/types/quoteRequest';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormatBadge } from '../FormatBadge';

interface QuoteRequestTableRowProps {
  quoteRequest: QuoteRequest;
  onSelect: (quoteRequest: QuoteRequest) => void;
}

export const QuoteRequestTableRow = ({
  quoteRequest,
  onSelect
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
    <TableRow 
      key={quoteRequest.id} 
      onClick={() => onSelect(quoteRequest)}
      className="cursor-pointer"
    >
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
    </TableRow>
  );
};
