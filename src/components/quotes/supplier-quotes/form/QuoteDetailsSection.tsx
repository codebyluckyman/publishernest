
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface QuoteDetailsSectionProps {
  quoteRequest: QuoteRequest;
  selectedSupplier: Supplier | null;
}

export function QuoteDetailsSection({ 
  quoteRequest, 
  selectedSupplier 
}: QuoteDetailsSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quote Request Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium">{quoteRequest.title}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Reference</p>
              <p className="font-medium">{quoteRequest.reference_id || "-"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline" className="mt-1">
                {quoteRequest.status}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">
                {quoteRequest.due_date ? formatDate(quoteRequest.due_date) : "No due date"}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Production Schedule</p>
              <p className="font-medium">
                {quoteRequest.production_schedule_requested ? "Requested" : "Not requested"}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-medium">{selectedSupplier?.supplier_name || "Unknown supplier"}</p>
            </div>
          </div>
          
          {quoteRequest.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{quoteRequest.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
