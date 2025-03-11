
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuoteForm } from "./QuoteForm";
import { SupplierQuote } from "@/types/quote";
import { useQuotesApi } from "@/hooks/useQuotesApi";
import { Organization } from "@/types/organization";

interface QuoteDialogProps {
  quote?: SupplierQuote;
  isOpen: boolean;
  onClose: () => void;
  currentOrganization: Organization | null;
}

export function QuoteDialog({ quote, isOpen, onClose, currentOrganization }: QuoteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createQuote, updateQuote } = useQuotesApi(currentOrganization);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (quote) {
        await updateQuote.mutateAsync({
          id: quote.id,
          ...data
        });
      } else {
        await createQuote.mutateAsync({
          ...data,
          organization_id: currentOrganization?.id as string
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quote ? 'Edit Quote' : 'Create New Quote'}</DialogTitle>
          <DialogDescription>
            {quote 
              ? 'Update the details of this supplier quote.' 
              : 'Enter the details for a new supplier quote.'}
          </DialogDescription>
        </DialogHeader>
        
        <QuoteForm
          quote={quote}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
