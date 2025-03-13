
import { format } from "date-fns";
import { QuoteRequest } from "@/types/quoteRequest";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "./StatusBadge";

type QuoteDetailsSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: QuoteRequest | null;
};

export const QuoteDetailsSheet = ({ 
  isOpen, 
  onOpenChange, 
  selectedRequest 
}: QuoteDetailsSheetProps) => {
  if (!selectedRequest) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quote Request Details</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4 mt-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
            <p className="mt-1">{selectedRequest.title}</p>
          </div>
          
          {selectedRequest.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="mt-1">{selectedRequest.description}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Supplier(s)</h3>
            {selectedRequest.supplier_names && selectedRequest.supplier_names.length > 0 ? (
              <div className="mt-1 space-y-1">
                {selectedRequest.supplier_names.map((name, index) => (
                  <div key={index}>{name}</div>
                ))}
              </div>
            ) : (
              <p className="mt-1">{selectedRequest.supplier_name || 'Unknown'}</p>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <div className="mt-1"><StatusBadge status={selectedRequest.status} /></div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Date Requested</h3>
            <p className="mt-1">{selectedRequest.requested_at ? format(new Date(selectedRequest.requested_at), "PPP") : 'N/A'}</p>
          </div>
          
          {selectedRequest.due_date && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
              <p className="mt-1">{format(new Date(selectedRequest.due_date), "PPP")}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Formats</h3>
            {selectedRequest.formats && selectedRequest.formats.length > 0 ? (
              <div className="border rounded-md divide-y">
                {selectedRequest.formats.map((format) => (
                  <div key={format.id} className="p-3">
                    <div className="flex justify-between">
                      <span className="font-medium">{format.format_name}</span>
                      <span>Qty: {format.quantity}</span>
                    </div>
                    {format.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{format.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No formats associated with this request.</p>
            )}
          </div>
          
          {selectedRequest.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Additional Notes</h3>
              <p className="mt-1">{selectedRequest.notes}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
