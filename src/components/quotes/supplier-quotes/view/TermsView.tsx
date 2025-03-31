
import { SupplierQuote } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface TermsViewProps {
  quote: SupplierQuote;
}

export function TermsView({ quote }: TermsViewProps) {
  // If no terms available
  if (!quote.terms) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm italic">No terms and conditions provided</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Terms & Conditions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-sm">
          {quote.terms}
        </div>
      </CardContent>
    </Card>
  );
}
