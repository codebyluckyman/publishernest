
import React, { useState } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, ExternalLink, History } from "lucide-react";
import { format } from "date-fns";
import { QuoteDetailsSheet } from "@/components/quotes/table/QuoteDetailsSheet";
import { formatCurrency } from "@/utils/formatters";

interface QuoteHeaderProps {
  quote: SupplierQuote;
  onEdit?: () => void;
  onShowHistory?: () => void;
}

export function QuoteHeader({ quote, onEdit, onShowHistory }: QuoteHeaderProps) {
  const [showQuoteRequestDetails, setShowQuoteRequestDetails] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "submitted":
        return <Badge variant="default">Submitted</Badge>;
      case "approved":
        return <Badge variant="secondary">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <>
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {quote.reference_id || quote.reference || "Quote"}
                </h2>
                <p className="text-muted-foreground">
                  Supplier: {quote.supplier_name || "Unknown Supplier"}
                </p>
              </div>
              <div className="text-right space-y-1">
                {quote.total_cost && (
                  <div className="text-2xl font-bold">
                    {formatCurrency(quote.total_cost, quote.currency)}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Currency: {quote.currency}
                </div>
              </div>
            </div>
            
            {/* Quote Request Details */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Quote Request:</span>
              {quote.quote_request?.title ? (
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm font-normal text-primary hover:text-primary/80"
                  onClick={() => setShowQuoteRequestDetails(true)}
                >
                  {quote.quote_request.title}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              ) : (
                <span className="text-sm">No title</span>
              )}
              {quote.quote_request?.reference_id && (
                <span className="text-sm text-muted-foreground">
                  ({quote.quote_request.reference_id})
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge(quote.status)}
            {onShowHistory && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onShowHistory}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                View History
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Summary Grid - Updated to 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              VALIDITY PERIOD
            </h3>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">From:</span>{" "}
                {formatDate(quote.valid_from)}
              </p>
              <p className="text-sm">
                <span className="font-medium">To:</span>{" "}
                {formatDate(quote.valid_to)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              SUBMISSION
            </h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(quote.status)}
              </div>
              <p className="text-sm">
                <span className="font-medium">Date:</span>{" "}
                {formatDate(quote.submitted_at)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              FORMATS
            </h3>
            <div className="space-y-1">
              {quote.formats && quote.formats.length > 0 ? (
                quote.formats.slice(0, 2).map((format, index) => (
                  <p key={index} className="text-sm">
                    {format.format_name}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No formats</p>
              )}
              {quote.formats && quote.formats.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{quote.formats.length - 2} more
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              CREATION
            </h3>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Created:</span>{" "}
                {formatDate(quote.created_at)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Updated:</span>{" "}
                {formatDate(quote.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Request Details Sheet */}
      <QuoteDetailsSheet
        isOpen={showQuoteRequestDetails}
        onOpenChange={setShowQuoteRequestDetails}
        selectedRequest={quote.quote_request}
        isSubmitting={false}
      />
    </>
  );
}
