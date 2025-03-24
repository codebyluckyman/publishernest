
import { useState, useCallback } from "react";
import { QuoteRequest } from "@/types/quoteRequest";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, CheckCircle, XCircle, Edit, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type QuoteRequestActionsProps = {
  request: QuoteRequest;
  onStatusChange: (id: string, status: 'approved' | 'declined' | 'pending') => void;
  onDelete: (id: string) => void;
  onViewDetails: (request: QuoteRequest) => void;
  onEdit: (request: QuoteRequest) => void;
  onViewSupplierQuotes?: (request: QuoteRequest) => void;
};

export const QuoteRequestActions = ({ 
  request, 
  onStatusChange, 
  onDelete, 
  onViewDetails,
  onEdit,
  onViewSupplierQuotes
}: QuoteRequestActionsProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleStatusChange = useCallback((status: 'approved' | 'declined' | 'pending') => {
    setIsMenuOpen(false);
    onStatusChange(request.id, status);
  }, [request.id, onStatusChange]);

  const handleDelete = useCallback(() => {
    setIsMenuOpen(false);
    onDelete(request.id);
  }, [request.id, onDelete]);

  const handleViewDetails = useCallback(() => {
    setIsMenuOpen(false);
    onViewDetails(request);
  }, [request, onViewDetails]);

  const handleEdit = useCallback(() => {
    setIsMenuOpen(false);
    onEdit(request);
  }, [request, onEdit]);

  const handleViewSupplierQuotes = useCallback(() => {
    if (onViewSupplierQuotes) {
      setIsMenuOpen(false);
      onViewSupplierQuotes(request);
    }
  }, [request, onViewSupplierQuotes]);

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
        <DropdownMenuItem onClick={handleViewDetails}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        {onViewSupplierQuotes && (
          <DropdownMenuItem onClick={handleViewSupplierQuotes}>
            <FileText className="mr-2 h-4 w-4" />
            <span>View Supplier Quotes</span>
          </DropdownMenuItem>
        )}
        {request.status !== "approved" && (
          <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Mark Active</span>
          </DropdownMenuItem>
        )}
        {request.status !== "declined" && (
          <DropdownMenuItem onClick={() => handleStatusChange("declined")}>
            <XCircle className="mr-2 h-4 w-4" />
            <span>Mark Inactive</span>
          </DropdownMenuItem>
        )}
        {request.status !== "pending" && (
          <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
            <span>Mark as Pending</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
