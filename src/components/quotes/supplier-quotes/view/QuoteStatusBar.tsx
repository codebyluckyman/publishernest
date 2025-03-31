
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

interface QuoteStatusBarProps {
  status: string;
  onSubmit?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  isPublisher: boolean;
}

export function QuoteStatusBar({ 
  status, 
  onSubmit, 
  onAccept, 
  onDecline,
  isPublisher
}: QuoteStatusBarProps) {
  const [declineReason, setDeclineReason] = useState("");
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  
  const handleDeclineConfirm = () => {
    if (onDecline) {
      onDecline();
    }
    setIsDeclineDialogOpen(false);
  };

  // Show actions based on status and user role
  const showSubmitButton = status === 'draft' && !isPublisher;
  const showAcceptDeclineButtons = status === 'submitted' && isPublisher;
  
  if (!showSubmitButton && !showAcceptDeclineButtons) {
    return null;
  }

  return (
    <div className="sticky bottom-0 bg-background pt-4 border-t">
      <div className="flex items-center justify-end gap-3 py-2">
        {showSubmitButton && onSubmit && (
          <Button onClick={onSubmit}>
            <Send className="mr-2 h-4 w-4" />
            Submit Quote
          </Button>
        )}
        
        {showAcceptDeclineButtons && (
          <>
            {onAccept && (
              <Button variant="default" onClick={onAccept}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept Quote
              </Button>
            )}
            
            {onDecline && (
              <AlertDialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline Quote
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Decline Quote</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to decline this quote? This action cannot be undone.
                      You may provide a reason below:
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Textarea
                    placeholder="Reason for declining (optional)"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="my-4"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeclineConfirm}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Decline
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
