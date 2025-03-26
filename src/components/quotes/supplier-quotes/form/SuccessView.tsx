
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SupplierQuoteAttachments } from "../SupplierQuoteAttachments";

interface SuccessViewProps {
  createdQuoteId: string;
  onDone?: () => void;
}

export function SuccessView({ createdQuoteId, onDone }: SuccessViewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-green-600">Quote created successfully!</h2>
        <p className="text-muted-foreground">Your quote has been saved as a draft. You can now manage attachments.</p>
      </div>
      
      <Card className="p-4">
        <SupplierQuoteAttachments 
          supplierQuote={{ id: createdQuoteId }} 
        />
      </Card>
      
      <div className="flex justify-center mt-6">
        <Button onClick={onDone} className="w-full md:w-auto">Done</Button>
      </div>
    </div>
  );
}
