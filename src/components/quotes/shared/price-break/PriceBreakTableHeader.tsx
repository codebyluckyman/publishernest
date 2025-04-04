
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PriceBreakTableHeaderProps {
  products: Array<{
    index: number;
    heading: string;
  }>;
}

export function PriceBreakTableHeader({ products }: PriceBreakTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className="w-[100px] h-7 py-1 text-xs">Quantity</TableHead>
        {products.map((product) => (
          <TableHead key={product.index} className="h-7 py-1 text-xs">
            {product.heading}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
