
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuoteForm } from "./QuoteForm";
import { SupplierQuote } from "@/types/quote";
import { useQuotesApi } from "@/hooks/useQuotesApi";
import { Organization } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest } from "@/types/quoteRequest";

interface QuoteDialogProps {
  quote?: SupplierQuote;
  isOpen: boolean;
  onClose: () => void;
  currentOrganization: Organization | null;
  initialQuoteRequestId?: string | null;
}

export function QuoteDialog({ 
  quote, 
  isOpen, 
  onClose, 
  currentOrganization, 
  initialQuoteRequestId = null 
}: QuoteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createQuote, updateQuote } = useQuotesApi(currentOrganization);
  const [quoteRequestId, setQuoteRequestId] = useState<string | null>(initialQuoteRequestId);

  useEffect(() => {
    if (quote) {
      setQuoteRequestId(quote.quote_request_id);
    } else {
      setQuoteRequestId(initialQuoteRequestId);
    }
  }, [quote, initialQuoteRequestId]);

  // Fetch quote requests for dropdown
  const { data: quoteRequests } = useQuery({
    queryKey: ['quoteRequestOptions', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      
      // Cast the result to the expected type
      try {
        const { data, error } = await supabase
          .from('quote_requests')
          .select('id, title, status')
          .eq('organization_id', currentOrganization.id)
          .in('status', ['draft', 'open'])
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching quote requests:', error);
          return [];
        }
        
        return data as unknown as Pick<QuoteRequest, 'id' | 'title' | 'status'>[];
      } catch (error) {
        console.error('Error in QuoteDialog query:', error);
        return [];
      }
    },
    enabled: !!currentOrganization && isOpen,
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (quote) {
        await updateQuote.mutateAsync({
          id: quote.id,
          ...data,
          quote_request_id: quoteRequestId
        });
      } else {
        await createQuote.mutateAsync({
          ...data,
          quote_request_id: quoteRequestId,
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
          quoteRequests={quoteRequests || []}
          quoteRequestId={quoteRequestId}
          setQuoteRequestId={setQuoteRequestId}
        />
      </DialogContent>
    </Dialog>
  );
}
