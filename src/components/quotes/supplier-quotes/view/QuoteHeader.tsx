
import { SupplierQuote } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, FileText, History } from "lucide-react";
import { format } from "date-fns";

interface QuoteHeaderProps {
  quote: SupplierQuote;
  onEdit?: () => void;
  onShowHistory?: () => void;
}

export function QuoteHeader({ quote, onEdit, onShowHistory }: QuoteHeaderProps) {
  // Format dates for display
  const submittedDate = quote.submitted_at 
    ? format(new Date(quote.submitted_at), 'MMM d, yyyy')
    : null;
  
  const validFrom = quote.valid_from
    ? format(new Date(quote.valid_from), 'MMM d, yyyy')
    : null;
  
  const validTo = quote.valid_to
    ? format(new Date(quote.valid_to), 'MMM d, yyyy')
    : null;

  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-200 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">
              {quote.quote_request?.title || 'Quote'}
              <Badge className={`ml-2 ${getStatusColor(quote.status)}`}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Badge>
            </CardTitle>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground mt-1">
              {quote.supplier?.supplier_name && (
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{quote.supplier.supplier_name}</span>
                </div>
              )}
              
              {submittedDate && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Submitted: {submittedDate}</span>
                </div>
              )}
              
              {(validFrom || validTo) && (
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    Valid: {validFrom || 'N/A'} - {validTo || 'N/A'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {onEdit && quote.status === 'draft' && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit Quote
              </Button>
            )}
            
            {onShowHistory && (
              <Button variant="outline" size="sm" onClick={onShowHistory}>
                <History className="mr-1 h-4 w-4" />
                History
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {(quote.reference || quote.reference_id) && (
        <CardContent className="pt-0">
          <div className="text-sm">
            <span className="font-medium">Reference:</span> {quote.reference || quote.reference_id}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
