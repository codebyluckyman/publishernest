
import React from 'react';
import { SupplierQuote } from '@/types/supplierQuote';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/date';
import { Check, Eye } from 'lucide-react';
import { SupplierQuoteDetailsSheet } from './details/SupplierQuoteDetailsSheet';

interface QuoteComparisonViewProps {
  quotes: SupplierQuote[];
  quoteRequestTitle?: string;
  onSelectQuote: (quote: SupplierQuote) => void;
  onViewDetails: (quote: SupplierQuote) => void;
}

export function QuoteComparisonView({ 
  quotes, 
  quoteRequestTitle,
  onSelectQuote,
  onViewDetails
}: QuoteComparisonViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {quoteRequestTitle ? `Quote Comparison: ${quoteRequestTitle}` : 'Quote Comparison'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="overflow-hidden">
              <CardHeader className="bg-muted">
                <CardTitle className="text-lg">{quote.supplier?.supplier_name}</CardTitle>
                <div className="text-sm text-muted-foreground">Ref: {quote.reference_id}</div>
              </CardHeader>
              <CardContent className="pt-4">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium">Status:</dt>
                    <dd className="text-right">{quote.status}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Total Cost:</dt>
                    <dd className="text-right">
                      {quote.total_cost ? 
                        `${quote.currency} ${Number(quote.total_cost).toFixed(2)}` : 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Submitted:</dt>
                    <dd className="text-right">{formatDate(quote.submitted_at) || 'Not submitted'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Valid Until:</dt>
                    <dd className="text-right">{formatDate(quote.valid_to) || 'N/A'}</dd>
                  </div>
                  
                  <div className="pt-4 flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1" 
                      onClick={() => onViewDetails(quote)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> Details
                    </Button>
                    {quote.status === 'submitted' && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onSelectQuote(quote)}
                      >
                        <Check className="h-4 w-4 mr-2" /> Select
                      </Button>
                    )}
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
