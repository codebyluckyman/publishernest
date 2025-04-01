
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuoteDetailsSectionProps {
  quoteRequest: QuoteRequest;
  selectedSupplier: Supplier | null;
}

export function QuoteDetailsSection({ quoteRequest, selectedSupplier }: QuoteDetailsSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quote Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Quote Request</p>
            <p className="font-medium">{quoteRequest.title}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Reference</p>
            <p className="font-medium">{quoteRequest.reference_id || 'N/A'}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="font-medium">
              {quoteRequest.created_at ? new Date(quoteRequest.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          
          {selectedSupplier && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-medium">{selectedSupplier.supplier_name}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
