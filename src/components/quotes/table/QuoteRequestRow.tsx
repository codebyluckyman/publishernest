
import { format } from "date-fns";
import { QuoteRequest } from "@/types/quoteRequest";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { SupplierDisplay } from "./SupplierDisplay";
import { FormatCountButton } from "./FormatCountButton";
import { QuoteRequestActions } from "./QuoteRequestActions";
import { Checkbox } from "@/components/ui/checkbox";

type QuoteRequestRowProps = {
  request: QuoteRequest;
  onStatusChange: (id: string, status: 'approved' | 'declined' | 'pending') => void;
  onDelete: (id: string) => void;
  onViewDetails: (request: QuoteRequest) => void;
  onEdit: (request: QuoteRequest) => void;
  isSelected: boolean;
  onSelectRow: (id: string, selected: boolean) => void;
};

export const QuoteRequestRow = ({
  request,
  onStatusChange,
  onDelete,
  onViewDetails,
  onEdit,
  isSelected,
  onSelectRow
}: QuoteRequestRowProps) => {
  return (
    <TableRow 
      key={request.id}
      className="cursor-pointer hover:bg-gray-50"
    >
      <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={(checked) => onSelectRow(request.id, !!checked)}
          className="mr-2"
        />
      </TableCell>
      <TableCell 
        className="font-medium"
        onClick={() => onViewDetails(request)}
      >
        {request.title}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <SupplierDisplay 
          supplierName={request.supplier_name || ''} 
          supplierNames={request.supplier_names || []} 
        />
      </TableCell>
      <TableCell onClick={() => onViewDetails(request)}>
        {format(new Date(request.requested_at), "MMM d, yyyy")}
      </TableCell>
      <TableCell onClick={() => onViewDetails(request)}>
        {request.due_date 
          ? format(new Date(request.due_date), "MMM d, yyyy") 
          : "Not set"}
      </TableCell>
      <TableCell onClick={() => onViewDetails(request)}>
        <StatusBadge status={request.status} />
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <FormatCountButton 
          formats={request.formats || []} 
          request={request}
          onClick={onViewDetails} 
        />
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <QuoteRequestActions 
          request={request}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
        />
      </TableCell>
    </TableRow>
  );
}
