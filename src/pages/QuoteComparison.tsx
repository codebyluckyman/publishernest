
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOrganization } from "@/context/OrganizationContext";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { QuoteComparisonView } from "@/components/quotes/supplier-quotes/QuoteComparisonView";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SupplierQuote } from "@/types/supplierQuote";

export default function QuoteComparison() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quoteRequestId = searchParams.get('quoteRequestId');
  const { currentOrganization } = useOrganization();
  const { useSupplierQuotesList, useApproveSupplierQuote } = useSupplierQuotes();
  const approveMutation = useApproveSupplierQuote();
  
  const [quoteRequestTitle, setQuoteRequestTitle] = useState<string | undefined>();
  
  const { data: quotes = [], isLoading } = useSupplierQuotesList(
    currentOrganization,
    undefined, // All statuses
    undefined, // All suppliers
    quoteRequestId || undefined
  );
  
  // Extract the quote request title if quotes are available
  useEffect(() => {
    if (quotes.length > 0 && quotes[0].quote_request) {
      setQuoteRequestTitle(quotes[0].quote_request.title);
    }
  }, [quotes]);
  
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
      }
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Quote Comparison</h1>
          <p className="text-gray-600">Compare quotes from different suppliers</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quotes
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
              There are no quotes available for comparison for this quote request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>
              Return to Quotes
            </Button>
          </CardContent>
        </Card>
      ) : (
        <QuoteComparisonView 
          quotes={quotes} 
          quoteRequestTitle={quoteRequestTitle}
          onSelectQuote={handleSelectQuote}
        />
      )}
    </div>
  );
}
