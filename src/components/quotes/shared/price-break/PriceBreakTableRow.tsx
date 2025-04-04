
import { TableCell, TableRow } from "@/components/ui/table";
import { Control } from "react-hook-form";
import { PriceBreakTableCell } from "./PriceBreakTableCell";

interface PriceBreakTableRowProps {
  priceBreak: any;
  priceBreakIndex: number;
  priceBreaks: any[];
  products: any[];
  isReadOnly: boolean;
  currency?: string;
  control?: Control<any>;
  fieldArrayName?: string;
  useSingleProductCost: boolean;
  useSingleCostForAll: boolean;
}

export function PriceBreakTableRow({
  priceBreak,
  priceBreakIndex,
  priceBreaks,
  products,
  isReadOnly,
  currency,
  control,
  fieldArrayName,
  useSingleProductCost,
  useSingleCostForAll
}: PriceBreakTableRowProps) {
  // Find the index in the form field array
  const fieldIndex = priceBreaks.findIndex(p => 
    (p.price_break_id === priceBreak.price_break_id || p.id === priceBreak.id)
  );

  return (
    <TableRow 
      key={priceBreak.id || priceBreak.price_break_id || priceBreakIndex} 
      className="h-7 hover:bg-gray-50"
    >
      <TableCell className="font-medium py-1 text-sm">
        {priceBreak.quantity.toLocaleString()}
      </TableCell>
      
      {products.map((product) => {
        const unitCostKey = `unit_cost_${product.index + 1}`;
        const unitCost = priceBreak[unitCostKey];
        
        if (!control || !fieldArrayName) {
          return (
            <TableCell key={product.index} className="py-1">-</TableCell>
          );
        }
        
        return (
          <PriceBreakTableCell
            key={product.index}
            productIndex={product.index}
            fieldIndex={fieldIndex}
            fieldArrayName={fieldArrayName}
            control={control}
            isReadOnly={isReadOnly}
            unitCost={unitCost}
            currency={currency}
            useSingleProductCost={useSingleProductCost}
            useSingleCostForAll={useSingleCostForAll}
          />
        );
      })}
    </TableRow>
  );
}
