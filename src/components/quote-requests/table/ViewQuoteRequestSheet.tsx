
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { QuoteRequest } from "@/types/quoteRequest";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useState } from "react";
import { QuoteRequestDialog } from "../QuoteRequestDialog";
import { StatusBadge } from "./quote-request-details/StatusBadge";
import { FormatsDisplay } from "./quote-request-details/FormatsDisplay";
import { ProductLinesTable } from "./quote-request-details/ProductLinesTable";
import { DateDisplay } from "./quote-request-details/DateDisplay";
import { useProductLines } from "./quote-request-details/useProductLines";

interface ViewQuoteRequestSheetProps {
  quoteRequest: QuoteRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewQuoteRequestSheet({
  quoteRequest,
  open,
  onOpenChange,
}: ViewQuoteRequestSheetProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { productLines, isLoading } = useProductLines(quoteRequest);

  if (!quoteRequest) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{quoteRequest.title}</SheetTitle>
          </SheetHeader>

          <Button 
            variant="outline" 
            className="mb-4 w-full"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Quote Request
          </Button>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Status
              </h3>
              <StatusBadge status={quoteRequest.status} />
            </div>

            {quoteRequest.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Description
                </h3>
                <p className="text-sm">{quoteRequest.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Formats
              </h3>
              <FormatsDisplay formats={quoteRequest.formats} />
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Product Lines
              </h3>
              <ProductLinesTable 
                productLines={productLines} 
                isLoading={isLoading} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DateDisplay label="Due Date" dateString={quoteRequest.due_date} />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Quotes
                </h3>
                <p className="text-sm">{quoteRequest.quotes_count || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DateDisplay label="Created" dateString={quoteRequest.created_at} />
              <DateDisplay label="Updated" dateString={quoteRequest.updated_at} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {quoteRequest && (
        <QuoteRequestDialog
          quoteRequest={quoteRequest}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          currentOrganization={quoteRequest.organization_id ? { id: quoteRequest.organization_id } as any : null}
        />
      )}
    </>
  );
}
