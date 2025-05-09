import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Control, useFormContext } from "react-hook-form";
import { formatCurrency } from "@/utils/formatters";
import { TableCell } from "@/components/ui/table";

interface PriceBreakTableCellProps {
  productIndex: number;
  fieldIndex: number;
  fieldArrayName: string;
  control: Control<any>;
  isReadOnly: boolean;
  unitCost: any;
  currency?: string;
  useSingleProductCost: boolean;
  useSingleCostForAll: boolean;
  productLength?: number;
}

export function PriceBreakTableCell({
  productIndex,
  fieldIndex,
  fieldArrayName,
  control,
  isReadOnly,
  unitCost,
  currency,
  useSingleProductCost,
  useSingleCostForAll,
  productLength,
}: PriceBreakTableCellProps) {
  const formContext = useFormContext();
  const unitCostKey = `unit_cost_${productIndex + 1}`;
  const costFieldName = `${fieldArrayName}.${fieldIndex}.${unitCostKey}`;

  if (isReadOnly) {
    return (
      <TableCell key={productIndex} className="py-1 text-sm">
        {unitCost != null ? formatCurrency(unitCost, currency || "USD") : "-"}
      </TableCell>
    );
  }

  // For Product 1 (index 0)
  if (productIndex === 0) {
    return (
      <TableCell key={productIndex} className="py-1">
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
                  value={field.value || ""}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? null : parseFloat(e.target.value);
                    field.onChange(value);

                    // If using single product cost, copy to all products
                    if (useSingleProductCost && formContext) {
                      formContext
                        .getValues(
                          `${fieldArrayName}.${fieldIndex}.price_break_id`
                        )
                        .products?.forEach((prod: any, idx: number) => {
                          if (idx > 0) {
                            const otherFieldName = `${fieldArrayName}.${fieldIndex}.unit_cost_${
                              idx + 1
                            }`;
                            formContext.setValue(otherFieldName, value);
                          }
                        });
                    }
                  }}
                  disabled={useSingleCostForAll}
                  tabIndex={fieldIndex * productLength! + productIndex + 1}
                  ref={(input) => {
                    input?.blur();
                    input?.focus({ preventScroll: true });
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </TableCell>
    );
  }

  // For other products
  return (
    <TableCell key={productIndex} className="py-1">
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
                value={field.value || ""}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? null : parseFloat(e.target.value);
                  field.onChange(value);
                }}
                disabled={useSingleProductCost || useSingleCostForAll}
                tabIndex={fieldIndex * productLength! + productIndex + 1}
                ref={(input) => {
                  input?.blur();
                  input?.focus({ preventScroll: true });
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </TableCell>
  );
}
