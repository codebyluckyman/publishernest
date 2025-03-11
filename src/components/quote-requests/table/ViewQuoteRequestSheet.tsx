
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { QuoteRequest } from "@/types/quoteRequest";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { FormatBadge } from "../FormatBadge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { QuoteRequestDialog } from "../QuoteRequestDialog";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface ViewQuoteRequestSheetProps {
  quoteRequest: QuoteRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProductLine {
  id: string;
  product_title: string;
  quantity: number;
  notes: string | null;
}

export function ViewQuoteRequestSheet({
  quoteRequest,
  open,
  onOpenChange,
}: ViewQuoteRequestSheetProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchProductLines = async () => {
      if (!quoteRequest?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('quote_request_products')
          .select(`
            id, 
            quantity, 
            notes,
            products:product_id (title)
          `)
          .eq('quote_request_id', quoteRequest.id);
          
        if (error) throw error;
        
        if (data) {
          const formattedData = data.map(item => ({
            id: item.id,
            product_title: item.products?.title || 'Unknown Product',
            quantity: item.quantity,
            notes: item.notes
          }));
          
          setProductLines(formattedData);
        }
      } catch (error) {
        console.error('Error fetching product lines:', error);
        toast.error('Failed to load product information');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (open && quoteRequest) {
      fetchProductLines();
    }
  }, [quoteRequest, open]);
  
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
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Product Lines
              </h3>
              {productLines.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          {line.product_title}
                          {line.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {line.notes}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{line.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <span className="text-muted-foreground text-sm">No products</span>
              )}
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
