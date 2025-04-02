
import { SupplierQuote } from "@/types/supplierQuote";
import { PriceBreakTable } from "@/components/quotes/shared/PriceBreakTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

  // Group extra costs by unit of measure
  const groupedCosts: Record<string, typeof quote.quote_request.extra_costs> = 
    quote.quote_request.extra_costs.reduce((acc, extraCost) => {
      const unitOfMeasure = unitOfMeasures.find(
        (unit) => unit.id === extraCost.unit_of_measure_id
      );
      
      // Skip inventory units, they are handled separately
      if (unitOfMeasure?.is_inventory_unit) {
        return acc;
      }
      
      const unitName = unitOfMeasure?.name || 'Other';
      if (!acc[unitName]) {
        acc[unitName] = [];
      }
      
      acc[unitName].push(extraCost);
      return acc;
    }, {} as Record<string, typeof quote.quote_request.extra_costs>);

  // First identify inventory unit costs
  const inventoryUnitCosts = quote.quote_request.extra_costs.filter(extraCost => {
    const unitOfMeasure = unitOfMeasures.find(
      (unit) => unit.id === extraCost.unit_of_measure_id
    );
    return unitOfMeasure?.is_inventory_unit;
  });

  return (
    <div className="space-y-6">
      {/* First render inventory unit costs as price break tables */}
      {inventoryUnitCosts.map((extraCost) => {
        const unitOfMeasure = unitOfMeasures.find(
          (unit) => unit.id === extraCost.unit_of_measure_id
        );
        
        // Prepare price breaks if they exist
        const priceBreaks = quote.quote_request?.formats?.[0]?.price_breaks || [];
        const products = [{ index: 0, heading: extraCost.name }];

        return (
          <PriceBreakTable
            key={extraCost.id}
            formatName={extraCost.name}
            formatDescription={`${extraCost.description || ''} (${unitOfMeasure?.name || 'Unknown unit'})`}
            priceBreaks={priceBreaks}
            products={products}
            isReadOnly={true}
            currency={quote.currency}
            className="mb-2"
          />
        );
      })}
      
      {/* Then render grouped non-inventory unit costs as tables */}
      {Object.entries(groupedCosts).map(([unitName, costs]) => {
        if (costs.length === 0) return null;
        
        return (
          <Card key={unitName} className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{unitName} Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costs.map((extraCost) => {
                    const supplierExtraCost = quote.extra_costs?.find(
                      (ec) => ec.extra_cost_id === extraCost.id
                    );
                    
                    // Find the unit of measure - check both from the quote request and from the supplier quote
                    const unitOfMeasureId = supplierExtraCost?.unit_of_measure_id || extraCost.unit_of_measure_id;
                    const unitOfMeasure = unitOfMeasures.find(
                      (unit) => unit.id === unitOfMeasureId
                    );
                    
                    return (
                      <TableRow key={extraCost.id}>
                        <TableCell>{extraCost.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {extraCost.description || 'No description'}
                        </TableCell>
                        <TableCell>{unitOfMeasure?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {supplierExtraCost?.unit_cost !== null && 
                           supplierExtraCost?.unit_cost !== undefined ? (
                            <span className="font-medium">
                              {formatCurrency(supplierExtraCost.unit_cost, quote.currency)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Not specified</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
