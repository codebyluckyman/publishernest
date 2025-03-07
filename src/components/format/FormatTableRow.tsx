import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";

export interface Format {
  id: string;
  format_name: string;
  tps: string | null;
  tps_text_height_mm: number | null;
  tps_text_width_mm: number | null;
  tps_text_depth_mm: number | null;
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
  // Format dimensions in HxWxD format
  const formatDimensions = () => {
    if (!format.tps_text_height_mm && !format.tps_text_width_mm && !format.tps_text_depth_mm) {
      return "N/A";
    }
    
    const height = format.tps_text_height_mm || 'mm';
    const width = format.tps_text_width_mm || 'mm';
    const depth = format.tps_text_depth_mm || 'mm'
    
    // Only include depth if it has a value
    if (format.tps_text_depth_mm) {
      return `${height} × ${width} × ${format.tps_text_depth_mm}`;
    }
    
    // Otherwise just show height and width
    return `${height} × ${width}`;
  };

  return (
    <TableRow 
      key={format.id}
      className="cursor-pointer"
      onClick={() => onViewFormat(format.id)}
    >
      <TableCell className="font-medium">{format.format_name}</TableCell>
      <TableCell>{format.tps || "N/A"}</TableCell>
      <TableCell>{formatDimensions()}</TableCell>
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
