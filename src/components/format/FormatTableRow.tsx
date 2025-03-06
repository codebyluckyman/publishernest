
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";

export interface Format {
  id: string;
  format_name: string;
  tps: string | null;
  extent: string | null;
  cover_stock_print: string | null;
  internal_stock_print: string | null;
  created_at: string;
  updated_at: string;
}

interface FormatTableRowProps {
  format: Format;
  onViewFormat: (formatId: string) => void;
  onEditFormat: (formatId: string) => void;
  formatDate: (dateString: string | null) => string;
}

export function FormatTableRow({ format, onViewFormat, onEditFormat, formatDate }: FormatTableRowProps) {
  return (
    <TableRow 
      key={format.id}
      className="cursor-pointer"
      onClick={() => onViewFormat(format.id)}
    >
      <TableCell className="font-medium">{format.format_name}</TableCell>
      <TableCell>{format.tps || "N/A"}</TableCell>
      <TableCell>{format.extent || "N/A"}</TableCell>
      <TableCell>{format.cover_stock_print || "N/A"}</TableCell>
      <TableCell>{format.internal_stock_print || "N/A"}</TableCell>
      <TableCell>{formatDate(format.created_at)}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              onViewFormat(format.id);
            }}
            title="View format"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              onEditFormat(format.id);
            }}
            title="Edit format"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
