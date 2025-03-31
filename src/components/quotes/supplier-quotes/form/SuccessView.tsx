
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

interface SuccessViewProps {
  createdQuoteId: string;
  onDone?: () => void;
  onSubmit?: () => void;
  isSubmitReady?: boolean;
  isSubmitting?: boolean;
}

export function SuccessView({ 
  createdQuoteId, 
  onDone, 
  onSubmit,
  isSubmitReady = false,
  isSubmitting = false
}: SuccessViewProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-10">
      <div className="bg-green-100 p-4 rounded-full">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Draft Quote Saved!</h3>
        <p className="text-muted-foreground mb-6">
          You can continue editing the quote or finalize it now.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {onSubmit && (
          <Button 
            onClick={onSubmit} 
            className="bg-green-600 hover:bg-green-700"
            disabled={!isSubmitReady || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Quote"}
          </Button>
        )}
        
        <Button asChild variant="outline">
          <Link to={`/supplier-quotes/${createdQuoteId}`}>
            View Quote Details
          </Link>
        </Button>
        
        {onDone && (
          <Button onClick={onDone} variant="ghost">
            Done
          </Button>
        )}
      </div>
    </div>
  );
}
