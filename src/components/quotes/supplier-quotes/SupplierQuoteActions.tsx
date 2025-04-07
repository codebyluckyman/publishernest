
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Eye, 
  Send, 
  Edit, 
  Trash, 
  FileText 
} from "lucide-react";
import { SupplierQuote, SupplierQuoteStatus } from "@/types/supplierQuote";

interface SupplierQuoteActionsProps {
  quote: SupplierQuote;
  onView: (quote: SupplierQuote) => void;
  onEdit: (quote: SupplierQuote) => void;
  onSubmit: (quote: SupplierQuote) => void;
  onDelete: (quote: SupplierQuote) => void;
}

export function SupplierQuoteActions({
  quote,
  onView,
  onEdit,
  onSubmit,
  onDelete
}: SupplierQuoteActionsProps) {
  const [open, setOpen] = useState(false);
  
  const handleView = () => {
    setOpen(false);
    onView(quote);
  };
  
  const handleEdit = () => {
    setOpen(false);
    onEdit(quote);
  };
  
  const handleSubmit = () => {
    setOpen(false);
    onSubmit(quote);
  };
  
  const handleDelete = () => {
    setOpen(false);
    onDelete(quote);
  };

  // Determine which actions should be available based on quote status
  const canEdit = quote.status === "draft";
  const canSubmit = quote.status === "draft";
  const canDelete = quote.status === "draft";
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </DropdownMenuItem>
        
        {canEdit && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        )}
        
        {canSubmit && (
          <DropdownMenuItem onClick={handleSubmit}>
            <Send className="mr-2 h-4 w-4" />
            <span>Submit</span>
          </DropdownMenuItem>
        )}
        
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
