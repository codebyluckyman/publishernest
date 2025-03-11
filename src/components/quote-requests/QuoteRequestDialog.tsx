
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuoteRequest } from "@/types/quoteRequest";
import { useQuoteRequestsApi } from "@/hooks/useQuoteRequestsApi";
import { Organization } from "@/types/organization";
import { QuoteRequestForm } from "./QuoteRequestForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      let quoteRequestId: string;
      
      if (quoteRequest) {
        // Update existing quote request
        await updateQuoteRequest.mutateAsync({
          id: quoteRequest.id,
          ...data
        });
        quoteRequestId = quoteRequest.id;
      } else {
        // Create new quote request
        const result = await createQuoteRequest.mutateAsync({
          ...data,
          organization_id: currentOrganization?.id as string
        });
        quoteRequestId = result.id;
      }
      
      // Handle format relationships
      if (data.format_ids && data.format_ids.length > 0) {
        // First, remove existing links
        await supabase
          .from('quote_request_formats')
          .delete()
          .eq('quote_request_id', quoteRequestId);
        
        // Then, create new links
        const formatLinks = data.format_ids.map((formatId: string) => ({
          quote_request_id: quoteRequestId,
          format_id: formatId
        }));
        
        const { error } = await supabase
          .from('quote_request_formats')
          .insert(formatLinks);
          
        if (error) {
          console.error("Error linking formats:", error);
          toast.error("Failed to link formats to the quote request");
        }
      }
      
      onClose();
    } catch (error) {
      console.error("Error in quote request submission:", error);
      toast.error("Failed to save quote request");
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
