
import { Button } from "@/components/ui/button";
import { QuoteRequest } from "@/types/quoteRequest";
import { useState } from "react";
import { SupplierQuoteDialog } from "../supplier-quotes/SupplierQuoteDialog";
import { Supplier } from "@/types/supplier";

interface QuoteResponseButtonProps {
  quoteRequest: QuoteRequest;
  isSmall?: boolean;
}

export function QuoteResponseButton({ quoteRequest, isSmall }: QuoteResponseButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Check if we have a supplier_id (legacy) or supplier_ids (new)
  const hasSingleSupplier = quoteRequest.supplier_id !== null;
  const hasMultipleSuppliers = quoteRequest.supplier_ids && quoteRequest.supplier_ids.length > 0;
  
  // If there's no supplier, we can't create a response
  if (!hasSingleSupplier && !hasMultipleSuppliers) {
    return null;
  }
  
  return (
    <>
      <Button
        variant="outline"
        size={isSmall ? "sm" : "default"}
        className="whitespace-nowrap"
        onClick={() => setDialogOpen(true)}
      >
        Create Quote Response
      </Button>
      
      <SupplierQuoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        quoteRequest={quoteRequest}
      />
    </>
  );
}
