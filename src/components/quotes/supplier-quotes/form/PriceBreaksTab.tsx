
import { Control } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { Card, CardContent } from "@/components/ui/card";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";

interface PriceBreaksTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function PriceBreaksTab({ control, quoteRequest }: PriceBreaksTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p>Price breaks component will be implemented here.</p>
        {/* Price breaks implementation will go here */}
      </CardContent>
    </Card>
  );
}
