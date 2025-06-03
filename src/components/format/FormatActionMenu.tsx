
import { useState } from "react";
import { Eye, Pencil, Copy, MoreHorizontal, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Format } from "./types/FormatTypes";
import { FormatCopyDialog } from "./FormatCopyDialog";
import { CreateQuoteRequestFromFormat } from "../quotes/CreateQuoteRequestFromFormat";
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface FormatActionMenuProps {
  format: Format;
  onViewFormat: (formatId: string) => void;
  onEditFormat: (formatId: string) => void;
  onFormatCopied?: (newFormatId?: string) => void;
}

export function FormatActionMenu({ format, onViewFormat, onEditFormat, onFormatCopied }: FormatActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleCompareQuotes = () => {
    setIsOpen(false);
    navigate(`/quotes/compare?formatId=${format.id}`);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Format Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => {
            onViewFormat(format.id);
            setIsOpen(false);
          }}>
            <Eye className="mr-2 h-4 w-4" />
            <span>View Format</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => {
            onEditFormat(format.id);
            setIsOpen(false);
          }}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit Format</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleCompareQuotes}>
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Compare Quotes</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
          >
            <FormatCopyDialog 
              format={format} 
              onFormatCopied={(newFormatId) => {
                setIsOpen(false);
                if (onFormatCopied) {
                  onFormatCopied(newFormatId);
                }
              }}
              triggerElement={
                <div className="flex items-center w-full">
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy Format</span>
                </div>
              }
            />
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <CreateQuoteRequestFromFormat
              formatId={format.id}
              buttonVariant="ghost"
              buttonSize="sm"
              buttonText="Create Quote Request"
              buttonIcon={true}
              className="flex items-center w-full"
              onSuccess={() => setIsOpen(false)}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
