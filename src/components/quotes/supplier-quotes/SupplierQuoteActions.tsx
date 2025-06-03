
import { useState } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Edit, Send, CheckCircle, XCircle, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface SupplierQuoteActionsProps {
  quote: SupplierQuote;
  onViewDetails: (quote: SupplierQuote) => void;
  onEdit?: (quote: SupplierQuote) => void;
  onSubmit?: (quote: SupplierQuote) => void;
  onApprove?: (quote: SupplierQuote) => void;
  onReject?: (quote: SupplierQuote) => void;
  onDelete?: (quote: SupplierQuote) => void;
}

export function SupplierQuoteActions({
  quote,
  onViewDetails,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  onDelete,
}: SupplierQuoteActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAction = (action: () => void) => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        <DropdownMenuItem onClick={() => handleAction(() => onViewDetails(quote))}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        {onEdit && quote.status === 'draft' && (
          <DropdownMenuItem onClick={() => handleAction(() => onEdit(quote))}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {onSubmit && quote.status === 'draft' && (
          <DropdownMenuItem onClick={() => handleAction(() => onSubmit(quote))}>
            <Send className="mr-2 h-4 w-4" />
            Submit
          </DropdownMenuItem>
        )}
        
        {onApprove && quote.status === 'submitted' && (
          <DropdownMenuItem onClick={() => handleAction(() => onApprove(quote))}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </DropdownMenuItem>
        )}
        
        {onReject && quote.status === 'submitted' && (
          <DropdownMenuItem onClick={() => handleAction(() => onReject(quote))}>
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </DropdownMenuItem>
        )}
        
        {onDelete && quote.status === 'draft' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleAction(() => onDelete(quote))}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
