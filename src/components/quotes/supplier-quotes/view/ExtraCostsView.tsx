
import { SupplierQuote } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

interface ExtraCostsViewProps {
  quote: SupplierQuote;
}

export function ExtraCostsView({ quote }: ExtraCostsViewProps) {
  // If no extra costs available
  if (!quote.extra_costs || quote.extra_costs.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Extra Costs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm italic">No extra costs</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Extra Costs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.extra_costs.map((extraCost) => (
              <TableRow key={extraCost.id}>
                <TableCell>{extraCost.extra_cost?.description || 'Unknown'}</TableCell>
                <TableCell>{extraCost.extra_cost?.category || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  {extraCost.unit_cost 
                    ? `${quote.currency} ${extraCost.unit_cost.toFixed(2)}`
                    : 'N/A'
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
