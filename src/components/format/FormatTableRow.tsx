
import { TableRow, TableCell } from "@/components/ui/table";
import { useState } from "react";
import { FormatActionMenu } from "./FormatActionMenu";
import { Format } from "./types/FormatTypes";
import { FormatDimensions } from "./FormatDimensions";

interface FormatTableRowProps {
  format: Format;
  onViewFormat: (formatId: string) => void;
  onEditFormat: (formatId: string) => void;
  formatDate: (dateString: string | null) => string;
  onFormatCopied?: (newFormatId?: string) => void;
}

export function FormatTableRow({ format, onViewFormat, onEditFormat, formatDate, onFormatCopied }: FormatTableRowProps) {
  return (
    <TableRow 
      key={format.id}
      className="cursor-pointer"
      onClick={() => onViewFormat(format.id)}
    >
      <TableCell className="font-medium">{format.format_name}</TableCell>
      <TableCell><FormatDimensions format={format} type="text" /></TableCell>
      <TableCell><FormatDimensions format={format} type="plc" /></TableCell>
      <TableCell>{format.extent || "N/A"}</TableCell>
      <TableCell>{format.cover_stock_print || "N/A"}</TableCell>
      <TableCell>{format.internal_stock_print || "N/A"}</TableCell>
      <TableCell>{formatDate(format.created_at)}</TableCell>
      <TableCell>
        <FormatActionMenu 
          format={format} 
          onViewFormat={onViewFormat}
          onEditFormat={onEditFormat}
          onFormatCopied={onFormatCopied}
        />
      </TableCell>
    </TableRow>
  );
}
