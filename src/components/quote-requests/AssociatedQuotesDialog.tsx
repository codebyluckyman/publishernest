import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuote } from "@/types/quote";
import { QuoteRequest } from "@/types/quoteRequest";
import { Organization } from "@/types/organization";
import { X, ExternalLink } from "lucide-react";
import { QuoteDialog } from "@/components/quotes/QuoteDialog";
import { useQuoteRequestsApi } from '@/hooks/quote-requests/useQuoteRequestsApi';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AssociatedQuotesDialogProps {
  quoteRequest: QuoteRequest;
  isOpen: boolean;
  onClose: () => void;
  currentOrganization: Organization | null;
}

export function AssociatedQuotesDialog({
  quoteRequest,
  isOpen,
  onClose,
  currentOrganization,
}: AssociatedQuotesDialogProps) {
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);

  // Fetch associated quotes
  const { data: associatedQuotes, isLoading } = useQuery({
    queryKey: ['associatedQuotes', quoteRequest.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_quotes')
        .select('*')
        .eq('quote_request_id', quoteRequest.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching associated quotes:', error);
        return [];
      }

      return data as SupplierQuote[];
    },
    enabled: isOpen, // Only fetch when dialog is open
  });

  const handleViewQuote = (quote: SupplierQuote) => {
    setSelectedQuote(quote);
    setIsQuoteDialogOpen(true);
  };

  const handleQuoteDialogClose = () => {
    setIsQuoteDialogOpen(false);
    setSelectedQuote(null);
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null) return '-';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl mb-2">
              Associated Quotes for "{quoteRequest.title}"
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>

          {isLoading ? (
            <div className="py-8 text-center">Loading associated quotes...</div>
          ) : !associatedQuotes || associatedQuotes.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No quotes have been created for this quote request yet.
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {associatedQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.supplier_name}</TableCell>
                      <TableCell>{quote.quote_number || '-'}</TableCell>
                      <TableCell>
                        {quote.quote_date ? format(new Date(quote.quote_date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(quote.total_amount, quote.currency_code)}
                      </TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewQuote(quote)}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quote Dialog */}
      {selectedQuote && (
        <QuoteDialog
          quote={selectedQuote}
          open={isQuoteDialogOpen}
          onOpenChange={setIsQuoteDialogOpen}
          currentOrganization={currentOrganization}
        />
      )}
    </>
  );
}
