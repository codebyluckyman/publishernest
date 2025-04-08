
import React from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SupplierQuoteDetails } from "../SupplierQuoteDetails";

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
  const navigate = useNavigate();

  const handleViewInFullPage = () => {
    if (quote) {
      navigate(`/quotes/${quote.id}/details`);
      onOpenChange(false);
    }
  };

  const handleApprove = () => {
    if (quote && onApprove) {
      onApprove(quote);
    }
  };

  const handleReject = () => {
    if (quote && onReject) {
      onReject(quote);
    }
  };

  return (
    <Sheet open={open && !!quote} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90%] sm:w-[550px] md:w-[650px] overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between mb-6">
          <SheetTitle className="text-xl">Quote Details</SheetTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewInFullPage}>
              <span className="mr-2">Full view</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {quote && (
          <div className="pr-6">
            <SupplierQuoteDetails 
              quote={quote} 
              onClose={() => onOpenChange(false)}
              onApprove={onApprove ? handleApprove : undefined}
              onReject={onReject ? handleReject : undefined}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
