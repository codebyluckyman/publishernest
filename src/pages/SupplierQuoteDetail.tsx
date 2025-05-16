
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { useOrganization } from "@/context/OrganizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText } from "lucide-react";
import { SupplierQuoteDetail } from "@/components/quotes/supplier-quotes/view/SupplierQuoteDetail";
import { SupplierQuoteAuditHistory } from "@/components/quotes/supplier-quotes/SupplierQuoteAuditHistory";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

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
  
  const { data: quote, isLoading, error, refetch } = useSupplierQuoteById(id || null);
  const submitMutation = useSubmitSupplierQuote();
  const approveMutation = useApproveSupplierQuote();
  const rejectMutation = useRejectSupplierQuote();
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  
  const isPublisher = currentOrganization?.organization_type === 'publisher';
  
  useEffect(() => {
    if (error) {
      toast.error("Error loading quote details");
      navigate("/quotes");
    }
  }, [error, navigate]);
  
  // Handle successful mutations
  useEffect(() => {
    if (approveMutation.isSuccess || rejectMutation.isSuccess || submitMutation.isSuccess) {
      refetch();
    }
  }, [approveMutation.isSuccess, rejectMutation.isSuccess, submitMutation.isSuccess, refetch]);

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
    }, {
      onSuccess: () => {
        toast.success("Quote approved successfully");
      }
    });
  };
  
  const handleOpenRejectDialog = () => {
    setRejectDialogOpen(true);
  };
  
  const handleReject = () => {
    if (!quote || !quote.id) {
      toast.error("Quote information is missing");
      return;
    }
    
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    
    rejectMutation.mutate({
      id: quote.id,
      reason: rejectionReason
    }, {
      onSuccess: () => {
        toast.success("Quote rejected successfully");
        setRejectDialogOpen(false);
        setRejectionReason("");
      }
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
      
      {showAuditHistory ? (
        <SupplierQuoteAuditHistory 
          supplierQuoteId={quote.id} 
          onBack={() => setShowAuditHistory(false)} 
        />
      ) : (
        <SupplierQuoteDetail 
          quote={quote} 
          isPublisher={isPublisher}
          onSubmit={quote.status === 'draft' ? handleSubmit : undefined}
          onApprove={quote.status === 'submitted' && isPublisher ? handleApprove : undefined}
          onReject={quote.status === 'submitted' && isPublisher ? handleOpenRejectDialog : undefined}
          onShowHistory={() => setShowAuditHistory(true)}
        />
      )}
      
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this quote:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Rejection reason"
            className="my-4"
            required
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRejectionReason('');
              setRejectDialogOpen(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={!rejectionReason.trim()}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default SupplierQuoteDetailPage;
