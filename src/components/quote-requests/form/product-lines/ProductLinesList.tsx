
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductLine } from "./types";

interface ProductLinesListProps {
  productLines: ProductLine[];
  onRemove: (index: number) => void;
}

export function ProductLinesList({ productLines, onRemove }: ProductLinesListProps) {
  if (productLines.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No product lines added yet
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="w-[100px]">Quantity</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="w-[60px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productLines.map((line, index) => (
          <TableRow key={index}>
            <TableCell>{line.product_title}</TableCell>
            <TableCell>{line.quantity}</TableCell>
            <TableCell>{line.notes}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
