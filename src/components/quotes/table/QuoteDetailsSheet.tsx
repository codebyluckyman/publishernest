
import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { QuoteRequest } from "@/types/quoteRequest";
import { QuoteAuditHistory } from "./QuoteAuditHistory";
import { QuoteDetails } from "./details/QuoteDetails";

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
  const [showAuditHistory, setShowAuditHistory] = useState(false);

  if (!selectedRequest) return null;

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
          <QuoteDetails
            selectedRequest={selectedRequest}
            onEdit={onEdit}
            onStatusChange={onStatusChange}
            onShowHistory={() => setShowAuditHistory(true)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
