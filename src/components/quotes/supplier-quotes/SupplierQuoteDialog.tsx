
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuoteRequest } from "@/types/quoteRequest";
import { useEffect, useState } from "react";
import { SupplierQuoteForm } from "./SupplierQuoteForm";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { useOrganization } from "@/context/OrganizationContext";
import { SupplierFormValues, SupplierQuoteFormValues } from "@/types/supplierQuote";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SupplierQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteRequest: QuoteRequest;
}

export function SupplierQuoteDialog({ open, onOpenChange, quoteRequest }: SupplierQuoteDialogProps) {
  const { currentOrganization } = useOrganization();
  const { useCreateSupplierQuote } = useSupplierQuotes();
  const createMutation = useCreateSupplierQuote();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

  // Initialize the form with the selected supplier
  useEffect(() => {
    if (open && quoteRequest) {
      if (quoteRequest.supplier_id) {
        setSelectedSupplierId(quoteRequest.supplier_id);
      } else if (quoteRequest.supplier_ids && quoteRequest.supplier_ids.length > 0) {
        setSelectedSupplierId(quoteRequest.supplier_ids[0]);
      }
    }
  }, [open, quoteRequest]);

  const handleSubmit = (data: SupplierQuoteFormValues) => {
    if (!currentOrganization) return;
    
    createMutation.mutate({
      formData: data,
      organizationId: currentOrganization.id
    }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create Quote Response</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-8rem)]">
          <div className="p-1">
            <SupplierQuoteForm
              quoteRequest={quoteRequest}
              initialValues={{
                quote_request_id: quoteRequest.id,
                supplier_id: selectedSupplierId,
                price_breaks: [],
                extra_costs: [],
                savings: [],
                currency: quoteRequest.currency || "USD"
              }}
              onSubmit={handleSubmit}
              isSubmitting={createMutation.isPending}
              onCancel={() => onOpenChange(false)}
              onSupplierChange={setSelectedSupplierId}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
