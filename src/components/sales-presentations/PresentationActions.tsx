
import { useState, useCallback } from "react";
import { SalesPresentation } from "@/types/salesPresentation";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Edit, Trash2, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PresentationActionsProps = {
  presentation: SalesPresentation;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
};

export const PresentationActions = ({ 
  presentation, 
  onDelete, 
  onShare,
  onView,
  onEdit
}: PresentationActionsProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleView = useCallback(() => {
    setIsMenuOpen(false);
    onView(presentation.id);
  }, [presentation.id, onView]);

  const handleEdit = useCallback(() => {
    setIsMenuOpen(false);
    onEdit(presentation.id);
  }, [presentation.id, onEdit]);

  const handleDelete = useCallback(() => {
    setIsMenuOpen(false);
    onDelete(presentation.id);
  }, [presentation.id, onDelete]);

  const handleShare = useCallback(() => {
    setIsMenuOpen(false);
    onShare(presentation.id);
  }, [presentation.id, onShare]);

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
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
