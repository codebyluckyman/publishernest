
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  isValid: boolean;
  onSubmit?: () => void;
  isSubmitReady?: boolean;
}

export function FormActions({ 
  isSubmitting, 
  onCancel, 
  isValid, 
  onSubmit,
  isSubmitReady = false
}: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 mt-6">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center">
              <Button 
                type="submit" 
                // IMPORTANT: Do not add isValid check to disabled as draft can be submitted without validation.
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save as Draft"}
              </Button>
              <HelpCircle className="w-4 h-4 ml-1 text-muted-foreground cursor-help" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm max-w-xs">Only supplier and quote request information is required. All other fields can be completed later.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {onSubmit && (
        <Button 
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !isSubmitReady}
          variant="default"
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? "Submitting..." : "Submit Quote"}
        </Button>
      )}
    </div>
  );
}
