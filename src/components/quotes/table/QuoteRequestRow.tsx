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
  onStatusChange: (
    id: string,
    status: "approved" | "declined" | "pending"
  ) => void;
  onDelete: (id: string) => void;
  onViewDetails: (request: QuoteRequest) => void;
  onEdit: (request: QuoteRequest) => void;
  onViewSupplierQuotes?: (request: QuoteRequest) => void;
  isSelected: boolean;
  onSelectRow: (id: string, selected: boolean) => void;
};

export const QuoteRequestRow = ({
  request,
  onStatusChange,
  onDelete,
  onViewDetails,
  onEdit,
  onViewSupplierQuotes,
  isSelected,
  onSelectRow,
}: QuoteRequestRowProps) => {
  return (
    <TableRow
      key={request.id}
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => onViewDetails(request)}
    >
      <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectRow(request.id, !!checked)}
          className="mr-2"
        />
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span>{request.title}</span>
          <span className="text-xs text-muted-foreground font-mono">
            {request.reference_id || "No reference"}
          </span>
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <SupplierDisplay
          supplierName={request.supplier_name || ""}
          supplierNames={request.supplier_names || []}
        />
      </TableCell>
      <TableCell>
        {format(new Date(request.requested_at), "MMM d, yyyy")}
      </TableCell>
      <TableCell>
        {request.due_date
          ? format(new Date(request.due_date), "MMM d, yyyy")
          : "Not set"}
      </TableCell>
      <TableCell>
        <StatusBadge status={request.status} />
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <FormatCountButton
          formats={request.formats || []}
          request={request}
          onClick={onViewDetails}
        />
      </TableCell>
      <TableCell className="font-medium w-30">
        <div className="flex flex-col">
          <span>
            {request.users?.first_name + " " + request.users?.last_name}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <QuoteRequestActions
          request={request}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onViewSupplierQuotes={onViewSupplierQuotes}
        />
      </TableCell>
    </TableRow>
  );
};
