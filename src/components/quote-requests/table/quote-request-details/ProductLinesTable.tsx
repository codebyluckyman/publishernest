
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ProductLine {
  id: string;
  product_title: string;
  quantity: number;
  notes: string | null;
}

interface ProductLinesTableProps {
  productLines: ProductLine[];
  isLoading: boolean;
}

export function ProductLinesTable({ productLines, isLoading }: ProductLinesTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (productLines.length === 0) {
    return <span className="text-muted-foreground text-sm">No products</span>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Qty</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productLines.map((line) => (
          <TableRow key={line.id}>
            <TableCell>
              {line.product_title}
              {line.notes && (
                <p className="text-xs text-muted-foreground mt-1">
                  {line.notes}
                </p>
              )}
            </TableCell>
            <TableCell className="text-right">{line.quantity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
