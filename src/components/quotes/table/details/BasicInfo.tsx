
import { format } from "date-fns";
import { QuoteRequest } from "@/types/quoteRequest";
import { Badge } from "@/components/ui/badge";

interface BasicInfoProps {
  request: QuoteRequest;
}

export function BasicInfo({ request }: BasicInfoProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <h4 className="text-sm font-medium mb-1">Reference</h4>
        <p className="text-sm font-mono">{request.reference_id || "No reference"}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-1">Requested</h4>
        <p className="text-sm">{format(new Date(request.requested_at), "MMMM d, yyyy")}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-1">Currency</h4>
        <p className="text-sm">{request.currency || "USD"}</p>
      </div>
      
      {request.due_date && (
        <div>
          <h4 className="text-sm font-medium mb-1">Due</h4>
          <p className="text-sm">
            {format(new Date(request.due_date), "MMMM d, yyyy")}
            {new Date(request.due_date) < new Date() && (
              <Badge variant="destructive" className="ml-2 text-[10px] mb-[5mm]">Overdue</Badge>
            )}
          </p>
        </div>
      )}
      
      {request.supplier_names && request.supplier_names.length > 0 && (
        <div className="col-span-2 md:col-span-4">
          <h4 className="text-sm font-medium mb-1">Suppliers</h4>
          <div className="flex flex-wrap gap-1">
            {request.supplier_names.map((name, index) => (
              <Badge key={index} variant="outline">{name}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
