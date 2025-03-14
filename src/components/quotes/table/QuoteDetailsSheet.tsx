
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormatCountButton } from "./FormatCountButton";
import { QuoteRequest } from "@/types/quoteRequest";
import { formatDate } from "@/lib/utils";
import { SupplierDisplay } from "./SupplierDisplay";
import { QuoteAuditHistory } from "./QuoteAuditHistory";
import { Eye, FileEdit, RotateCcw, CheckCircle, XCircle, ClockIcon } from "lucide-react";

interface QuoteDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: QuoteRequest | null;
  onEdit?: (request: QuoteRequest) => void;
  onStatusChange?: (id: string, status: 'approved' | 'declined' | 'pending') => void;
}

export function QuoteDetailsSheet({
  isOpen,
  onOpenChange,
  selectedRequest,
  onEdit,
  onStatusChange,
}: QuoteDetailsSheetProps) {
  const [showAuditHistory, setShowAuditHistory] = React.useState(false);

  if (!selectedRequest) return null;

  const handleStatusChange = (status: 'approved' | 'declined' | 'pending') => {
    if (onStatusChange) {
      onStatusChange(selectedRequest.id, status);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(selectedRequest);
    }
  };

  const handleClose = (open: boolean) => {
    // Reset audit history view when closing the sheet
    if (!open) {
      setShowAuditHistory(false);
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quote Request Details</SheetTitle>
        </SheetHeader>

        {showAuditHistory ? (
          <QuoteAuditHistory 
            quoteRequest={selectedRequest} 
            isOpen={showAuditHistory}
            onOpenChange={(open) => setShowAuditHistory(open)} 
          />
        ) : (
          <div className="space-y-6 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">{selectedRequest.title}</h2>
                <div className="flex items-center mt-2 space-x-2">
                  <StatusBadge status={selectedRequest.status} />
                  {selectedRequest.formats && selectedRequest.formats.length > 0 && (
                    <FormatCountButton formats={selectedRequest.formats} />
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEdit}
                  >
                    <FileEdit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAuditHistory(true)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  History
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                    <SupplierDisplay 
                      supplierName={selectedRequest.supplier_name || ''}
                      supplierNames={selectedRequest.supplier_names || []}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested on</p>
                    <p className="font-medium">{formatDate(selectedRequest.requested_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due date</p>
                    <p className="font-medium">
                      {selectedRequest.due_date ? formatDate(selectedRequest.due_date) : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <StatusBadge status={selectedRequest.status} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedRequest.description && (
              <div>
                <h3 className="text-md font-medium mb-2">Description</h3>
                <p className="text-sm whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>
            )}

            {onStatusChange && (
              <div>
                <h3 className="text-md font-medium mb-2">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedRequest.status === "approved" ? "default" : "outline"}
                    onClick={() => handleStatusChange("approved")}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant={selectedRequest.status === "declined" ? "destructive" : "outline"}
                    onClick={() => handleStatusChange("declined")}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                  <Button
                    variant={selectedRequest.status === "pending" ? "secondary" : "outline"}
                    onClick={() => handleStatusChange("pending")}
                    className="flex-1"
                  >
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Pending
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
