
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { useOrganization } from "@/context/OrganizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText } from "lucide-react";
import { SupplierQuoteDetail } from "@/components/quotes/supplier-quotes/view/SupplierQuoteDetail";
import { toast } from "sonner";

const SupplierQuoteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { 
    useSupplierQuoteById, 
    useSubmitSupplierQuote, 
    useApproveSupplierQuote, 
    useRejectSupplierQuote 
  } = useSupplierQuotes();
  
  const { data: quote, isLoading, error } = useSupplierQuoteById(id || null);
  const submitMutation = useSubmitSupplierQuote();
  const approveMutation = useApproveSupplierQuote();
  const rejectMutation = useRejectSupplierQuote();
  
  // Check if the current organization is a publisher
  const isPublisher = currentOrganization?.organization_type === 'publisher';
  
  // If quote not found, redirect to quotes page
  useEffect(() => {
    if (error) {
      navigate("/quotes");
    }
  }, [error, navigate]);

  const handleSubmit = () => {
    if (!quote || !quote.id) {
      toast.error("Quote information is missing");
      return;
    }
    
    if (!quote.total_cost) {
      toast.error("Total cost must be calculated before submission");
      return;
    }
    
    submitMutation.mutate({
      id: quote.id,
      totalCost: quote.total_cost
    }, {
      onSuccess: () => {
        toast.success("Quote submitted successfully");
      }
    });
  };
  
  const handleApprove = () => {
    if (!quote || !quote.id || !quote.total_cost) {
      toast.error("Quote information is incomplete");
      return;
    }
    
    approveMutation.mutate({
      id: quote.id,
      approvedCost: quote.total_cost
    });
  };
  
  const handleReject = (reason?: string) => {
    if (!quote || !quote.id) {
      toast.error("Quote information is missing");
      return;
    }
    
    if (!reason) {
      toast.error("Rejection reason is required");
      return;
    }
    
    rejectMutation.mutate({
      id: quote.id,
      reason
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/quotes")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quotes
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!quote) {
    return (
      <Card className="border shadow-md">
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <CardTitle className="text-xl">Quote Not Found</CardTitle>
          <p className="text-muted-foreground text-center">
            The supplier quote you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/quotes")}>
            View All Quotes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/quotes")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quotes
        </Button>
      </div>
      
      <SupplierQuoteDetail 
        quote={quote} 
        isPublisher={isPublisher}
        onSubmit={handleSubmit}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default SupplierQuoteDetailPage;
