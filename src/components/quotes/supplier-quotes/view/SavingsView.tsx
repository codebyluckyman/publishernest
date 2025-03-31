
import { SupplierQuote } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Minus } from "lucide-react";

interface SavingsViewProps {
  quote: SupplierQuote;
}

export function SavingsView({ quote }: SavingsViewProps) {
  // If no savings available
  if (!quote.savings || quote.savings.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Minus className="w-5 h-5 mr-2" />
            Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm italic">No savings applied</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Minus className="w-5 h-5 mr-2" />
          Savings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.savings.map((saving) => (
              <TableRow key={saving.id}>
                <TableCell>{saving.saving?.description || 'Unknown'}</TableCell>
                <TableCell>{saving.saving?.category || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  {saving.unit_cost 
                    ? `${quote.currency} ${saving.unit_cost.toFixed(2)}`
                    : 'N/A'
                  }
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {saving.notes || 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
