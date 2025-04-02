
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { formatCurrency } from "@/utils/formatters";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
  const [globalUnitCost, setGlobalUnitCost] = useState<string>('');
  
  // Apply global unit cost to all price breaks and products
  const applyGlobalUnitCost = () => {
    if (!control || !fieldArrayName) return;
    
    const costValue = globalUnitCost === '' ? null : parseFloat(globalUnitCost);
    
    sortedPriceBreaks.forEach((priceBreak, priceBreakIndex) => {
      // Find the index in the form field array
      const fieldIndex = priceBreaks.findIndex(p => 
        (p.price_break_id === priceBreak.price_break_id || p.id === priceBreak.id)
      );
      
      if (fieldIndex !== -1) {
        products.forEach((product) => {
          const unitCostKey = `unit_cost_${product.index + 1}`;
          const costFieldName = `${fieldArrayName}.${fieldIndex}.${unitCostKey}`;
          control.setValue(costFieldName, costValue);
        });
      }
    });
  };

  // Render selection controls for editing features if we're in edit mode
  const renderEditingControls = () => {
    if (isReadOnly || !control || products.length <= 1) return null;
    
    return (
      <div className="flex flex-col space-y-3 p-3 bg-muted/30 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="use-single-product-cost" 
            checked={useSingleProductCost} 
            onCheckedChange={(checked) => setUseSingleProductCost(checked === true)}
            disabled={useSingleCostForAll}
          />
          <Label htmlFor="use-single-product-cost" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Apply Product 1 cost to all products
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="use-single-cost-for-all" 
            checked={useSingleCostForAll} 
            onCheckedChange={(checked) => setUseSingleCostForAll(checked === true)}
          />
          <Label htmlFor="use-single-cost-for-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Use one cost for all price breaks & products
          </Label>
        </div>
        
        {useSingleCostForAll && (
          <div className="flex items-center space-x-2 pt-2">
            <div className="relative w-32">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">{currency}</span>
              </div>
              <Input
                placeholder="0.00"
                className="pl-10 h-8"
                type="number"
                step="0.01"
                min="0"
                value={globalUnitCost}
                onChange={(e) => setGlobalUnitCost(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="h-8" 
              onClick={applyGlobalUnitCost}
            >
              Apply
            </Button>
          </div>
        )}
      </div>
    );
  };

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
                      
                      // For Product 1 (index 0)
                      if (product.index === 0) {
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
                                        
                                        // If using single product cost, copy to all products
                                        if (useSingleProductCost) {
                                          products.forEach((prod) => {
                                            if (prod.index > 0) {
                                              const otherFieldName = `${fieldArrayName}.${fieldIndex}.unit_cost_${prod.index + 1}`;
                                              control.setValue(otherFieldName, value);
                                            }
                                          });
                                        }
                                      }}
                                      disabled={useSingleCostForAll}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                        );
                      } else {
                        // For other products
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
                                      disabled={useSingleProductCost || useSingleCostForAll}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                        );
                      }
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
        {renderEditingControls()}
      </CardContent>
    </Card>
  );
}
