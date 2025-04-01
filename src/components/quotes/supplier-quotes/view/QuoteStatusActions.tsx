
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Send, XCircle } from "lucide-react";
import { SupplierQuote, SupplierQuoteStatus } from "@/types/supplierQuote";

interface QuoteStatusActionsProps {
  quote: SupplierQuote;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: (reason?: string) => void;
  isPublisher: boolean;
}

export function QuoteStatusActions({ 
  quote, 
  onSubmit, 
  onApprove, 
  onReject,
  isPublisher
}: QuoteStatusActionsProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  
  const handleRejectConfirm = () => {
    if (onReject) {
      onReject(rejectReason);
    }
    setIsRejectDialogOpen(false);
  };

  // Show actions based on status and user role
  const showSubmitButton = quote.status === 'draft' && !isPublisher;
  const showApproveRejectButtons = quote.status === 'submitted' && isPublisher;
  
  if (!showSubmitButton && !showApproveRejectButtons) {
    return null;
  }

  return (
    <div className="sticky bottom-0 bg-background pt-4 border-t">
      <div className="flex items-center justify-end gap-3 py-2">
        {showSubmitButton && onSubmit && (
          <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700">
            <Send className="mr-2 h-4 w-4" />
            Submit Quote
          </Button>
        )}
        
        {showApproveRejectButtons && (
          <>
            {onApprove && (
              <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={onApprove}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Quote
              </Button>
            )}
            
            {onReject && (
              <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Quote
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Quote</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject this quote? This action cannot be undone.
                      Please provide a reason for rejecting:
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Textarea
                    placeholder="Reason for rejecting (required)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="my-4"
                    required
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleRejectConfirm}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={!rejectReason.trim()}
                    >
                      Reject
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        )}
      </div>
    </div>
  );
}
