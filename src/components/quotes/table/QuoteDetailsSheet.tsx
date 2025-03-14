
import { useState } from "react";
import { format } from "date-fns";
import { Clock, ClipboardList, Calendar, Tag, User, MessageSquare, FileText } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QuoteRequest } from "@/types/quoteRequest";
import { StatusBadge } from "./StatusBadge";
import { SupplierDisplay } from "./SupplierDisplay";
import { FormatCountButton } from "./FormatCountButton";
import { QuoteAuditHistory } from "./QuoteAuditHistory";

interface QuoteDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: QuoteRequest | null;
}

export function QuoteDetailsSheet({
  isOpen,
  onOpenChange,
  selectedRequest,
}: QuoteDetailsSheetProps) {
  const [auditHistoryOpen, setAuditHistoryOpen] = useState(false);

  if (!selectedRequest) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              <span className="truncate">{selectedRequest.title}</span>
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <StatusBadge status={selectedRequest.status} />
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Formats</h3>
                <FormatCountButton formats={selectedRequest.formats} />
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Supplier</h3>
                <SupplierDisplay 
                  supplierName={selectedRequest.supplier_name} 
                  supplierNames={selectedRequest.supplier_names} 
                />
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Requested</h3>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  {format(new Date(selectedRequest.requested_at), "PPP")}
                </div>
              </div>

              {selectedRequest.due_date && (
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {format(new Date(selectedRequest.due_date), "PPP")}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {selectedRequest.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Description
                </h3>
                <p className="text-sm whitespace-pre-line">{selectedRequest.description}</p>
              </div>
            )}

            {selectedRequest.notes && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Notes
                </h3>
                <p className="text-sm whitespace-pre-line">{selectedRequest.notes}</p>
              </div>
            )}

            <Separator />
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setAuditHistoryOpen(true)}
                className="w-full"
              >
                View Audit History
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <QuoteAuditHistory 
        quoteRequest={selectedRequest}
        isOpen={auditHistoryOpen}
        onOpenChange={setAuditHistoryOpen}
      />
    </>
  );
}
