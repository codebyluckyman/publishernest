
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { formatCurrency } from "@/utils/formatters";

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
            <TableBody>
              {sortedPriceBreaks.map((priceBreak, priceBreakIndex) => (
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
                    
                    if (isReadOnly) {
                      return (
                        <TableCell key={product.index} className="py-1 text-sm">
                          {unitCost != null 
                            ? formatCurrency(unitCost, currency || 'USD') 
                            : '-'}
                        </TableCell>
                      );
                    } else if (control && fieldArrayName) {
                      // Find the index in the form field array
                      const fieldIndex = priceBreaks.findIndex(p => 
                        (p.price_break_id === priceBreak.price_break_id || p.id === priceBreak.id)
                      );
                      
                      const costFieldName = `${fieldArrayName}.${fieldIndex}.${unitCostKey}`;
                      
                      return (
                        <TableCell key={product.index} className="py-1">
                          <FormField
                            control={control}
                            name={costFieldName as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full h-6 px-2 py-1 text-xs"
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      const value = e.target.value === '' ? null : parseFloat(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell key={product.index} className="py-1">-</TableCell>
                      );
                    }
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
