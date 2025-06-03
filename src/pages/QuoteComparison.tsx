
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOrganization } from "@/context/OrganizationContext";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { useFormats } from "@/hooks/useFormats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { QuoteComparisonView } from "@/components/quotes/supplier-quotes/QuoteComparisonView";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SupplierQuote } from "@/types/supplierQuote";
import { SupplierQuoteDetailsSheet } from "@/components/quotes/supplier-quotes/details/SupplierQuoteDetailsSheet";

export default function QuoteComparison() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quoteRequestId = searchParams.get('quoteRequestId');
  const formatId = searchParams.get('formatId');
  const { currentOrganization } = useOrganization();
  const { useSupplierQuotesComparison, useApproveSupplierQuote } = useSupplierQuotes();
  const { useFormatById } = useFormats();
  const approveMutation = useApproveSupplierQuote();
  
  const [quoteRequestTitle, setQuoteRequestTitle] = useState<string | undefined>();
  const [formatName, setFormatName] = useState<string | undefined>();
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  
  // Get format details if comparing by format
  const { data: format } = useFormatById(formatId || "");
  
  // Use the comparison API with appropriate filters
  const { data: quotes = [], isLoading } = useSupplierQuotesComparison(
    currentOrganization,
    undefined, // All statuses
    undefined, // All suppliers
    quoteRequestId || undefined,
    undefined, // No search query
    undefined, // No product filter
    formatId || undefined // Format filter
  );
  
  // Extract the quote request title if quotes are available
  useEffect(() => {
    if (quotes.length > 0 && quotes[0].quote_request) {
      setQuoteRequestTitle(quotes[0].quote_request.title);
    }
  }, [quotes]);

  // Set format name when format data is available
  useEffect(() => {
    if (format) {
      setFormatName(format.format_name);
    }
  }, [format]);
  
  const handleSelectQuote = (quote: SupplierQuote) => {
    if (quote.status !== 'submitted') {
      toast.error("Only submitted quotes can be approved");
      return;
    }
    
    approveMutation.mutate({
      id: quote.id,
      approvedCost: quote.total_cost || 0
    }, {
      onSuccess: () => {
        toast.success("Quote approved successfully");
        setDetailsSheetOpen(false);
      }
    });
  };

  const handleViewDetails = (quote: SupplierQuote) => {
    setSelectedQuote(quote);
    setDetailsSheetOpen(true);
  };

  const handleBackNavigation = () => {
    if (formatId) {
      navigate('/formats');
    } else {
      navigate('/quotes');
    }
  };

  const getPageTitle = () => {
    if (formatId && formatName) {
      return `Quote Comparison: ${formatName}`;
    } else if (quoteRequestId && quoteRequestTitle) {
      return `Quote Comparison: ${quoteRequestTitle}`;
    }
    return "Quote Comparison";
  };

  const getPageDescription = () => {
    if (formatId) {
      return "Compare quotes from different suppliers for this format";
    }
    return "Compare quotes from different suppliers for this quote request";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">{getPageTitle()}</h1>
          <p className="text-gray-600">{getPageDescription()}</p>
        </div>
        <Button variant="outline" onClick={handleBackNavigation}>
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          {formatId ? 'Back to Formats' : 'Back to Quotes'}
        </Button>
      </div>
      
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[350px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-[400px] w-full" />
            </div>
          </CardContent>
        </Card>
      ) : quotes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Quotes Found</CardTitle>
            <CardDescription>
              {formatId 
                ? "There are no quotes available for this format." 
                : "There are no quotes available for comparison for this quote request."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackNavigation}>
              {formatId ? 'Return to Formats' : 'Return to Quotes'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <QuoteComparisonView 
            quotes={quotes} 
            quoteRequestTitle={formatId ? formatName : quoteRequestTitle}
            onSelectQuote={handleSelectQuote}
          />
          
          {/* Supplier Quote Details Sheet */}
          <SupplierQuoteDetailsSheet
            quote={selectedQuote}
            open={detailsSheetOpen}
            onOpenChange={setDetailsSheetOpen}
            onApprove={handleSelectQuote}
          />
        </>
      )}
    </div>
  );
}
