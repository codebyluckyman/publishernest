
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import { Control, useFormContext } from "react-hook-form";
import { useState } from "react";
import { PriceBreakTableHeader } from "./PriceBreakTableHeader";
import { PriceBreakTableRow } from "./PriceBreakTableRow";
import { PriceBreakEditControls } from "./PriceBreakEditControls";

interface PriceBreakProduct {
  index: number;
  heading: string;
}

interface PriceBreak {
  id?: string;
  price_break_id?: string;
  quantity: number;
  [key: string]: any; // For dynamic unit_cost fields
}

interface PriceBreakTableProps {
  formatName: string;
  formatDescription?: string;
  priceBreaks: PriceBreak[];
  products: PriceBreakProduct[];
  isReadOnly?: boolean;
  currency?: string;
  control?: Control<any>;
  fieldArrayName?: string;
  className?: string;
}

export function PriceBreakTable({
  formatName,
  formatDescription,
  priceBreaks,
  products,
  isReadOnly = false,
  currency,
  control,
  fieldArrayName,
  className
}: PriceBreakTableProps) {
  // Sort price breaks by quantity
  const sortedPriceBreaks = [...priceBreaks].sort((a, b) => a.quantity - b.quantity);
  
  // State for enhanced editing features
  const [useSingleProductCost, setUseSingleProductCost] = useState(false);
  const [useSingleCostForAll, setUseSingleCostForAll] = useState(false);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-muted/30 py-2">
        <CardTitle className="text-base">{formatName}</CardTitle>
        {formatDescription && (
          <CardDescription className="text-xs">
            {formatDescription}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-2">
          <Table>
            <PriceBreakTableHeader products={products} />
            <TableBody>
              {sortedPriceBreaks.map((priceBreak, priceBreakIndex) => (
                <PriceBreakTableRow
                  key={priceBreak.id || priceBreak.price_break_id || priceBreakIndex}
                  priceBreak={priceBreak}
                  priceBreakIndex={priceBreakIndex}
                  priceBreaks={priceBreaks}
                  products={products}
                  isReadOnly={isReadOnly}
                  currency={currency}
                  control={control}
                  fieldArrayName={fieldArrayName}
                  useSingleProductCost={useSingleProductCost}
                  useSingleCostForAll={useSingleCostForAll}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        <PriceBreakEditControls
          isReadOnly={isReadOnly}
          control={control}
          fieldArrayName={fieldArrayName}
          priceBreaks={priceBreaks}
          products={products}
          currency={currency}
        />
      </CardContent>
    </Card>
  );
}
