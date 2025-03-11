
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuoteRequest } from "@/types/quoteRequest";
import { useQuoteRequestsApi } from "@/hooks/useQuoteRequestsApi";
import { Organization } from "@/types/organization";
import { QuoteRequestForm } from "./QuoteRequestForm";

interface QuoteRequestDialogProps {
  quoteRequest?: QuoteRequest;
  isOpen: boolean;
  onClose: () => void;
  currentOrganization: Organization | null;
}

export function QuoteRequestDialog({ quoteRequest, isOpen, onClose, currentOrganization }: QuoteRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createQuoteRequest, updateQuoteRequest } = useQuoteRequestsApi(currentOrganization);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (quoteRequest) {
        await updateQuoteRequest.mutateAsync({
          id: quoteRequest.id,
          ...data
        });
      } else {
        await createQuoteRequest.mutateAsync({
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
          <DialogTitle>{quoteRequest ? 'Edit Quote Request' : 'Create New Quote Request'}</DialogTitle>
          <DialogDescription>
            {quoteRequest 
              ? 'Update the details of this quote request.' 
              : 'Enter the details for a new quote request.'}
          </DialogDescription>
        </DialogHeader>
        
        <QuoteRequestForm
          quoteRequest={quoteRequest}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
