
import { Control } from "react-hook-form";
import { QuoteRequest, QuoteRequestFormat } from "@/types/quoteRequest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { PriceBreakTable } from "@/components/quotes/shared/price-break/PriceBreakTable";

interface PriceBreaksTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function PriceBreaksTab({ control, quoteRequest }: PriceBreaksTabProps) {
  // Extract formats and their price breaks from the quote request
  const formats = quoteRequest.formats || [];
  
  // For each format, create a price break table
  return (
    <div className="space-y-6">
      {formats.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No formats with price breaks found in this quote request.</p>
          </CardContent>
        </Card>
      ) : (
        formats.map((format) => {
          // Get price breaks for this format
          // Updated to use the format's price_breaks directly instead of quoteRequest.price_breaks
          const formatPriceBreaks = format.price_breaks || [];
          
          // Get products for this format
          const formatProducts = format.products?.map((product, index) => ({
            index,
            heading: product.product_name || `Product ${index + 1}`,
          })) || [];
          
          if (formatPriceBreaks.length === 0) {
            return null;
          }
          
          return (
            <Card key={format.format_id || format.id}>
              <CardHeader>
                <CardTitle className="text-lg">Format: {format.format_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <PriceBreakTable
                  formatName={format.format_name || ""}
                  formatDescription={format.notes || ""}
                  priceBreaks={formatPriceBreaks}
                  products={formatProducts}
                  control={control}
                  fieldArrayName="price_breaks"
                />
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
