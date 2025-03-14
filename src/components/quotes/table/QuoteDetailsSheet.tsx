
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
  onClose: () => void;
  quoteRequest: QuoteRequest | null;
  onEdit: (request: QuoteRequest) => void;
  onStatusChange: (id: string, status: 'approved' | 'declined' | 'pending') => void;
}

export function QuoteDetailsSheet({
  isOpen,
  onClose,
  quoteRequest,
  onEdit,
  onStatusChange,
}: QuoteDetailsSheetProps) {
  const [showAuditHistory, setShowAuditHistory] = React.useState(false);

  if (!quoteRequest) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quote Request Details</SheetTitle>
        </SheetHeader>

        {showAuditHistory ? (
          <QuoteAuditHistory 
            quoteRequestId={quoteRequest.id} 
            onBack={() => setShowAuditHistory(false)} 
          />
        ) : (
          <div className="space-y-6 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">{quoteRequest.title}</h2>
                <div className="flex items-center mt-2 space-x-2">
                  <StatusBadge status={quoteRequest.status} />
                  {quoteRequest.formats && quoteRequest.formats.length > 0 && (
                    <FormatCountButton formats={quoteRequest.formats} />
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(quoteRequest)}
                >
                  <FileEdit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
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
                      supplierName={quoteRequest.supplier_name || ''}
                      supplierNames={quoteRequest.supplier_names || []}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested on</p>
                    <p className="font-medium">{formatDate(quoteRequest.requested_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due date</p>
                    <p className="font-medium">
                      {quoteRequest.due_date ? formatDate(quoteRequest.due_date) : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <StatusBadge status={quoteRequest.status} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {quoteRequest.description && (
              <div>
                <h3 className="text-md font-medium mb-2">Description</h3>
                <p className="text-sm whitespace-pre-wrap">{quoteRequest.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-md font-medium mb-2">Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={quoteRequest.status === "approved" ? "default" : "outline"}
                  onClick={() => onStatusChange(quoteRequest.id, "approved")}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant={quoteRequest.status === "declined" ? "destructive" : "outline"}
                  onClick={() => onStatusChange(quoteRequest.id, "declined")}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Decline
                </Button>
                <Button
                  variant={quoteRequest.status === "pending" ? "secondary" : "outline"}
                  onClick={() => onStatusChange(quoteRequest.id, "pending")}
                  className="flex-1"
                >
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Pending
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
