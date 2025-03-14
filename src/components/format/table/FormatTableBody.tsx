
import { TableBody } from "@/components/ui/table";
import { FormatTableRow } from "../FormatTableRow";
import { Format } from "../types/FormatTypes";

interface FormatTableBodyProps {
  formats: Format[];
  onViewFormat: (formatId: string) => void;
  onEditFormat: (formatId: string) => void;
  formatDate: (dateString: string | null) => string;
  onFormatCopied: (newFormatId?: string) => void;
}

export function FormatTableBody({
  formats,
  onViewFormat,
  onEditFormat,
  formatDate,
  onFormatCopied
}: FormatTableBodyProps) {
  return (
    <TableBody>
      {formats.map((format) => (
        <FormatTableRow
          key={format.id}
          format={format}
          onViewFormat={onViewFormat}
          onEditFormat={onEditFormat}
          formatDate={formatDate}
          onFormatCopied={onFormatCopied}
        />
      ))}
    </TableBody>
  );
}
