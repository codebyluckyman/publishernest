
import { format } from "date-fns";
import { QuoteRequest } from "@/types/quoteRequest";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { SupplierDisplay } from "./SupplierDisplay";
import { FormatCountButton } from "./FormatCountButton";
import { QuoteRequestActions } from "./QuoteRequestActions";

type QuoteRequestRowProps = {
  request: QuoteRequest;
  onStatusChange: (id: string, status: 'approved' | 'declined' | 'pending') => void;
  onDelete: (id: string) => void;
  onViewDetails: (request: QuoteRequest) => void;
  onEdit: (request: QuoteRequest) => void;
};

export const QuoteRequestRow = ({
  request,
  onStatusChange,
  onDelete,
  onViewDetails,
  onEdit
}: QuoteRequestRowProps) => {
  return (
    <TableRow key={request.id}>
      <TableCell className="font-medium">{request.title}</TableCell>
      <TableCell><SupplierDisplay request={request} /></TableCell>
      <TableCell>
        {format(new Date(request.requested_at), "MMM d, yyyy")}
      </TableCell>
      <TableCell>
        {request.due_date 
          ? format(new Date(request.due_date), "MMM d, yyyy") 
          : "Not set"}
      </TableCell>
      <TableCell><StatusBadge status={request.status} /></TableCell>
      <TableCell>
        <FormatCountButton 
          request={request} 
          onClick={onViewDetails} 
        />
      </TableCell>
      <TableCell className="text-right">
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
