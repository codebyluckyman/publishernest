import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuoteComparisonView } from "@/components/quotes/supplier-quotes/QuoteComparisonView";
import type { SupplierQuote } from "@/types/supplierQuote";

interface QuoteComparisonTableProps {
  quotes: SupplierQuote[];
  formatId?: string;
  onQuoteSelect: (quoteId: string) => void;
}

export function QuoteComparisonTable({
  quotes,
  formatId,
  onQuoteSelect,
}: QuoteComparisonTableProps) {
  const handleSelectQuote = (quote: SupplierQuote) => {
    onQuoteSelect(quote.id);
  };

  return (
    <DialogContent className="max-w-[85vw] max-h-[90vh] p-0 flex flex-col">
      <DialogHeader className="flex-shrink-0 p-6 border-b">
        <DialogTitle>Quote Comparison</DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto p-6">
        <QuoteComparisonView
          quotes={quotes}
          quoteRequestTitle="Select a quote to use"
          onSelectQuote={handleSelectQuote}
        />
      </div>
    </DialogContent>
  );
}
