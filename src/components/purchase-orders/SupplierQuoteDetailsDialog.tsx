
import { useState } from 'react';
import { SupplierQuote } from '@/types/supplierQuote';
import { useSupplierQuotesByProduct } from '@/hooks/useSupplierQuotesByProduct';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface SupplierQuoteDetailsDialogProps {
  quoteId: string;
}

export function SupplierQuoteDetailsDialog({ quoteId }: SupplierQuoteDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  if (!quoteId || quoteId === 'manual') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Supplier Quote Details</DialogTitle>
          <DialogDescription>
            Details about the selected quote
          </DialogDescription>
        </DialogHeader>

        <QuoteDetails quoteId={quoteId} />
      </DialogContent>
    </Dialog>
  );
}

function QuoteDetails({ quoteId }: { quoteId: string }) {
  const { quotes, isLoading } = useSupplierQuotesByProduct();
  
  if (isLoading) {
    return <div>Loading quote details...</div>;
  }
  
  const quote = quotes.find(q => q.id === quoteId);
  
  if (!quote) {
    return <div>Quote details not found</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium">Reference</h3>
          <p>{quote.reference_id || quote.reference || 'N/A'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium">Supplier</h3>
          <p>{quote.supplier?.supplier_name || 'Unknown'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium">Status</h3>
          <Badge variant={quote.status === 'approved' ? 'success' : 'default'}>
            {quote.status}
          </Badge>
        </div>
        
        <div>
          <h3 className="text-sm font-medium">Currency</h3>
          <p>{quote.currency}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium">Valid From</h3>
          <p>{quote.valid_from || 'N/A'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium">Valid To</h3>
          <p>{quote.valid_to || 'N/A'}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Price Breaks</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.price_breaks && quote.price_breaks.length > 0 ? (
              quote.price_breaks.map((priceBreak) => (
                <TableRow key={priceBreak.id}>
                  <TableCell>{priceBreak.quantity}</TableCell>
                  <TableCell>{formatCurrency(priceBreak.unit_cost || 0, quote.currency)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">No price breaks found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div>
        <h3 className="text-sm font-medium">Notes</h3>
        <p className="whitespace-pre-line">{quote.notes || 'No notes'}</p>
      </div>
    </div>
  );
}
