
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuote } from "@/types/supplierQuote";
import { SupplierQuoteDetails } from "./SupplierQuoteDetails";
import { SupplierQuoteAuditHistory } from "../SupplierQuoteAuditHistory";

interface SupplierQuoteDetailsSheetProps {
  quote: SupplierQuote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (quote: SupplierQuote) => void;
  onReject?: (quote: SupplierQuote, reason?: string) => void;
}

export function SupplierQuoteDetailsSheet({
  quote,
  open,
  onOpenChange,
  onApprove,
  onReject
}: SupplierQuoteDetailsSheetProps) {
  const [showAuditHistory, setShowAuditHistory] = useState(false);

  const handleClose = (open: boolean) => {
    // Reset audit history view when closing the sheet
    if (!open) {
      setShowAuditHistory(false);
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open && !!quote} onOpenChange={handleClose}>
      <SheetContent className="w-[90%] sm:w-[550px] md:w-[650px] overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between mb-6">
          <SheetTitle className="text-xl">
            {showAuditHistory ? "Audit History" : "Quote Details"}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)] pr-4">
          {quote && (
            <>
              {showAuditHistory ? (
                <SupplierQuoteAuditHistory 
                  supplierQuoteId={quote.id}
                  onBack={() => setShowAuditHistory(false)}
                />
              ) : (
                <SupplierQuoteDetails 
                  quote={quote} 
                  onClose={() => onOpenChange(false)}
                  onApprove={onApprove ? () => onApprove(quote) : undefined}
                  onReject={onReject ? (reason) => onReject(quote, reason) : undefined}
                  onShowHistory={() => setShowAuditHistory(true)}
                />
              )}
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
