
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { QuoteRequest } from "@/types/quoteRequest";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { FormatBadge } from "../FormatBadge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useState } from "react";
import { QuoteRequestDialog } from "../QuoteRequestDialog";

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
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "open":
        return <Badge variant="default">Open</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
              <div>{getStatusBadge(quoteRequest.status)}</div>
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
              <div className="flex flex-wrap gap-2">
                {quoteRequest.formats && quoteRequest.formats.length > 0 ? (
                  quoteRequest.formats.map((format) => (
                    <FormatBadge key={format.id} format={format} />
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">None</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Due Date
                </h3>
                <p className="text-sm">{formatDate(quoteRequest.due_date)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Quotes
                </h3>
                <p className="text-sm">{quoteRequest.quotes_count || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Created
                </h3>
                <p className="text-sm">{formatDate(quoteRequest.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Updated
                </h3>
                <p className="text-sm">{formatDate(quoteRequest.updated_at)}</p>
              </div>
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
