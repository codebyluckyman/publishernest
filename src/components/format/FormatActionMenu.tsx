
import { Eye, Pencil, Copy, FileText, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Format } from "./types/FormatTypes";
import { FormatCopyDialog } from "./FormatCopyDialog";
import { CreateQuoteRequestFromFormat } from "../quotes/CreateQuoteRequestFromFormat";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface FormatActionMenuProps {
  format: Format;
  onViewFormat: (formatId: string) => void;
  onEditFormat: (formatId: string) => void;
  onFormatCopied?: (newFormatId?: string) => void;
}

export function FormatActionMenu({ format, onViewFormat, onEditFormat, onFormatCopied }: FormatActionMenuProps) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Format Actions">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem onClick={() => onViewFormat(format.id)}>
            <Eye className="h-4 w-4 mr-2" />
            <span>View Format</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onEditFormat(format.id)}>
            <Pencil className="h-4 w-4 mr-2" />
            <span>Edit Format</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
          >
            <FormatCopyDialog 
              format={format} 
              onFormatCopied={onFormatCopied}
              triggerElement={
                <div className="flex items-center w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  <span>Copy Format</span>
                </div>
              }
            />
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <div className="flex items-center w-full">
              <CreateQuoteRequestFromFormat
                formatId={format.id}
                buttonVariant="ghost"
                buttonSize="sm"
                buttonText="Create Quote Request"
                buttonIcon={true}
                className="flex items-center p-0 h-auto w-full justify-start hover:bg-transparent"
              />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
