
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SupplierQuote } from "@/types/quote";

interface ViewQuoteSheetProps {
  selectedQuote: SupplierQuote | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  getStatusBadgeClasses: (status: string) => string;
  formatCurrency: (amount: number | null, currency: string) => string;
}

export const ViewQuoteSheet = ({
  selectedQuote,
  isOpen,
  onOpenChange,
  getStatusBadgeClasses,
  formatCurrency
}: ViewQuoteSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="md:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quote Details</SheetTitle>
          <SheetDescription>
            Quote from {selectedQuote?.supplier_name || "Supplier"}
          </SheetDescription>
        </SheetHeader>
        
        {selectedQuote && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Supplier</h3>
                <p className="mt-1 text-sm">{selectedQuote.supplier_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Quote Number</h3>
                <p className="mt-1 text-sm">{selectedQuote.quote_number || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Quote Date</h3>
                <p className="mt-1 text-sm">
                  {selectedQuote.quote_date ? format(new Date(selectedQuote.quote_date), 'MMMM d, yyyy') : "—"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Valid Until</h3>
                <p className="mt-1 text-sm">
                  {selectedQuote.valid_until ? format(new Date(selectedQuote.valid_until), 'MMMM d, yyyy') : "—"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClasses(selectedQuote.status)}`}>
                    {selectedQuote.status.charAt(0).toUpperCase() + selectedQuote.status.slice(1)}
                  </span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                <p className="mt-1 text-sm font-medium">
                  {formatCurrency(selectedQuote.total_amount, selectedQuote.currency_code)}
                </p>
              </div>
            </div>

            {selectedQuote.contact_email || selectedQuote.contact_phone ? (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                <div className="mt-1 space-y-1">
                  {selectedQuote.contact_email && (
                    <p className="text-sm">Email: {selectedQuote.contact_email}</p>
                  )}
                  {selectedQuote.contact_phone && (
                    <p className="text-sm">Phone: {selectedQuote.contact_phone}</p>
                  )}
                </div>
              </div>
            ) : null}

            {selectedQuote.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 text-sm whitespace-pre-wrap">{selectedQuote.notes}</p>
              </div>
            )}

            {selectedQuote.items && selectedQuote.items.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Quote Items</h3>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuote.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unit_price, selectedQuote.currency_code)}</TableCell>
                          <TableCell>{formatCurrency(item.subtotal, selectedQuote.currency_code)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <Button 
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
