
import { MoreHorizontal, Edit, Trash2, EyeIcon, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SupplierQuote } from "@/types/quote";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface QuoteTableRowProps {
  quote: SupplierQuote;
  onView: (quote: SupplierQuote) => void;
  onEdit: (quote: SupplierQuote) => void;
  onDelete: (quoteId: string) => void;
  getStatusBadgeClasses: (status: string) => string;
  formatCurrency: (amount: number | null, currency: string) => string;
}

export const QuoteTableRow = ({
  quote,
  onView,
  onEdit,
  onDelete,
  getStatusBadgeClasses,
  formatCurrency
}: QuoteTableRowProps) => {
  return (
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
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem onClick={() => onView(quote)}>
              <EyeIcon className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(quote)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Quote
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onDelete(quote.id)}
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
