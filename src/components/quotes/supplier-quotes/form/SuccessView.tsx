
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";

interface SuccessViewProps {
  createdQuoteId: string;
  onDone?: () => void;
  onSubmit?: () => void;
  isSubmitReady: boolean;
  isSubmitting: boolean;
}

export function SuccessView({
  createdQuoteId,
  onDone,
  onSubmit,
  isSubmitReady,
  isSubmitting
}: SuccessViewProps) {
  return (
    <Card className="mx-auto max-w-xl mt-8 border shadow">
      <CardHeader className="bg-muted/50">
        <CardTitle className="flex items-center text-green-600">
          <Check className="mr-2 h-6 w-6" />
          Quote Created Successfully
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        <p className="text-muted-foreground">
          Your supplier quote has been saved as a draft. You can now:
        </p>
        
        <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground ml-4">
          <li>Submit the quote if you've completed all price breaks</li>
          <li>Exit and return to the quotes list</li>
          <li>Edit the quote details later</li>
        </ul>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4 pt-2">
        <Button variant="outline" onClick={onDone}>
          Done
        </Button>
        
        {onSubmit && (
          <Button 
            onClick={onSubmit}
            disabled={!isSubmitReady || isSubmitting}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Quote"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
