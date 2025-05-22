
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow 
} from '@/components/ui/table';
import { SupplierQuote } from '@/types/supplierQuote';
import { SupplierQuoteRow } from './SupplierQuoteRow';
import { SupplierQuotesEmptyState } from './SupplierQuotesEmptyState';
import { SupplierQuoteDetailsSheet } from './details/SupplierQuoteDetailsSheet';

export interface SupplierQuotesTableProps {
  quotes?: SupplierQuote[];
  loading?: boolean;
  printRunId?: string;
  quoteRequestId?: string;
  limitToSubmitted?: boolean; // Add this prop to fix the error
  onCreateNew?: () => void;
  onApprove?: (quoteId: string) => void;
  className?: string;
}

export const SupplierQuotesTable: React.FC<SupplierQuotesTableProps> = ({
  quotes = [],
  loading = false,
  printRunId,
  quoteRequestId,
  limitToSubmitted = false, // Default value
  onCreateNew,
  onApprove,
  className = '',
}) => {
  const [selectedQuote, setSelectedQuote] = React.useState<SupplierQuote | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const handleDetailClick = (quote: SupplierQuote) => {
    setSelectedQuote(quote);
    setDetailsOpen(true);
  };

  const handleApproveClick = (quote: SupplierQuote) => {
    if (onApprove) {
      onApprove(quote.id);
    }
  };
  
  // Determine if we have any results to display
  const hasQuotes = Array.isArray(quotes) && quotes.length > 0;

  // Show loading state
  if (loading) {
    return <div>Loading supplier quotes...</div>;
  }

  // Show empty state if no quotes
  if (!hasQuotes) {
    return (
      <SupplierQuotesEmptyState 
        printRunId={printRunId}
        quoteRequestId={quoteRequestId}
        onCreateNew={onCreateNew} 
      />
    );
  }

  return (
    <>
      <Table className={className}>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Print Run</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <SupplierQuoteRow
              key={quote.id}
              quote={quote}
              onDetailClick={() => handleDetailClick(quote)}
              onApprove={onApprove ? () => handleApproveClick(quote) : undefined}
            />
          ))}
        </TableBody>
      </Table>

      <SupplierQuoteDetailsSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        quote={selectedQuote}
      />
    </>
  );
};
