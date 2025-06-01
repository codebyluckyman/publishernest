
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { useOrganization } from "@/context/OrganizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Edit, Printer, Download } from "lucide-react";
import { SupplierQuoteDetail } from "@/components/quotes/supplier-quotes/view/SupplierQuoteDetail";
import { SupplierQuoteAuditHistory } from "@/components/quotes/supplier-quotes/SupplierQuoteAuditHistory";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";

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

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info("Export functionality coming soon");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
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
        
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container mx-auto px-4 py-6">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
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
          
          <div>
            <h1 className="text-2xl font-bold">
              Supplier Quote Details
            </h1>
            <p className="text-muted-foreground">
              Quote Request: {quote.title || quote.quote_request?.title || "Untitled"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quote Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl">
                  {quote.reference || quote.reference_id || "No Reference"}
                </CardTitle>
                <Badge className={getStatusColor(quote.status)}>
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                From: <span className="font-medium">{quote.supplier_name || "Unknown Supplier"}</span>
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
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">VALIDITY PERIOD</h4>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">From:</span> {quote.valid_from ? format(new Date(quote.valid_from), "MMM d, yyyy") : "Not specified"}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">To:</span> {quote.valid_to ? format(new Date(quote.valid_to), "MMM d, yyyy") : "Not specified"}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">SUBMISSION</h4>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">Submitted:</span> {quote.submitted_at ? format(new Date(quote.submitted_at), "MMM d, yyyy") : "Not submitted"}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Created:</span> {format(new Date(quote.created_at), "MMM d, yyyy")}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">FORMATS</h4>
              <div className="text-sm">
                {quote.formats && quote.formats.length > 0 ? (
                  <span>{quote.formats.length} format{quote.formats.length !== 1 ? 's' : ''} included</span>
                ) : (
                  <span className="text-muted-foreground">No formats</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
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
