
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuoteRequest } from "@/types/quoteRequest";
import { useQuoteRequestsApi } from "@/hooks/useQuoteRequestsApi";
import { Organization } from "@/types/organization";
import { QuoteRequestForm } from "./QuoteRequestForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuoteRequestDialogProps {
  quoteRequest?: QuoteRequest | null;
  isOpen: boolean;
  onClose: () => void;
  currentOrganization: Organization | null;
}

export function QuoteRequestDialog({ quoteRequest, isOpen, onClose, currentOrganization }: QuoteRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createQuoteRequest, updateQuoteRequest, refetch } = useQuoteRequestsApi(currentOrganization);
  
  // Reset submitting state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (data: any) => {
    if (!currentOrganization) {
      toast.error("No organization selected");
      return;
    }
    
    setIsSubmitting(true);
    try {
      let quoteRequestId: string;
      
      // Extract format_ids from the form data
      const { format_ids, ...quoteRequestData } = data;
      
      if (quoteRequest) {
        // Update existing quote request
        await updateQuoteRequest.mutateAsync({
          id: quoteRequest.id,
          ...quoteRequestData // Send data without format_ids
        });
        quoteRequestId = quoteRequest.id;
      } else {
        // Create new quote request
        const result = await createQuoteRequest.mutateAsync({
          ...quoteRequestData, // Send data without format_ids
          organization_id: currentOrganization.id
        });
        quoteRequestId = result.id;
      }
      
      // Handle format relationships
      if (format_ids && format_ids.length > 0) {
        // First, remove existing links
        await supabase
          .from('quote_request_formats')
          .delete()
          .eq('quote_request_id', quoteRequestId);
        
        // Then, create new links
        const formatLinks = format_ids.map((formatId: string) => ({
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
      
      toast.success(`Quote request ${quoteRequest ? 'updated' : 'created'} successfully`);
      
      // Delayed closing to ensure state is fully updated
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 300);
    } catch (error) {
      console.error("Error in quote request submission:", error);
      toast.error("Failed to save quote request");
      setIsSubmitting(false);
    }
  };

  // Dialog close handler that prevents closing during submission
  const handleDialogOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      // Trigger a data refresh when dialog closes
      refetch();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
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
          quoteRequest={quoteRequest || undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
