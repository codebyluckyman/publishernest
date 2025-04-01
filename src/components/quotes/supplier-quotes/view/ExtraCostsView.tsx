
import { SupplierQuote } from "@/types/supplierQuote";
import { PriceBreakTable } from "@/components/quotes/shared/PriceBreakTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";

interface ExtraCostsViewProps {
  quote: SupplierQuote;
}

export function ExtraCostsView({ quote }: ExtraCostsViewProps) {
  const { unitOfMeasures } = useUnitOfMeasures();

  // If no extra costs, show empty state
  if (!quote.quote_request?.extra_costs || quote.quote_request.extra_costs.length === 0) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <h3 className="text-lg font-medium">No Extra Costs</h3>
        <p className="text-muted-foreground mt-2">
          This quote request does not have any extra costs defined.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quote.quote_request.extra_costs.map((extraCost) => {
        // Find the unit of measure
        const unitOfMeasure = unitOfMeasures.find(
          (unit) => unit.id === extraCost.unit_of_measure_id
        );

        // Check if it's an inventory unit that needs price breaks
        if (unitOfMeasure?.is_inventory_unit) {
          // Prepare price breaks if they exist
          const priceBreaks = quote.quote_request?.formats?.[0]?.price_breaks || [];
          const products = [{ index: 0, heading: extraCost.name }];

          return (
            <PriceBreakTable
              key={extraCost.id}
              formatName={extraCost.name}
              formatDescription={`${extraCost.description || ''} (${unitOfMeasure.name})`}
              priceBreaks={priceBreaks}
              products={products}
              isReadOnly={true}
              currency={quote.currency}
              className="mb-2"
            />
          );
        }

        // For non-inventory units, show a simple card
        return (
          <Card key={extraCost.id} className="mb-2">
            <CardHeader>
              <CardTitle className="text-base">{extraCost.name}</CardTitle>
              {extraCost.description && (
                <CardDescription>{extraCost.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <span>Unit of Measure:</span>
                <span>{unitOfMeasure?.name || 'Not specified'}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
