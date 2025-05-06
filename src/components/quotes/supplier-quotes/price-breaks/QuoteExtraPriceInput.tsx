import React from "react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { sub } from "date-fns";

interface QuoteExtraPriceInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  subIndex?: number;
  extraCostIndex?: number;
  quantityIndex?: number;
}

export const QuoteExtraPriceInput: React.FC<QuoteExtraPriceInputProps> = ({
  id,
  value,
  onChange,
  disabled = false,
  subIndex = 0,
  extraCostIndex = 0,
  quantityIndex = 0,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Only allow numbers and a single decimal point
    if (/^$|^[0-9]+(\.[0-9]*)?$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const valueAsNumber = parseFloat(e.target.value);

    if (!isNaN(valueAsNumber)) {
      onChange(valueAsNumber.toFixed(2));
    }
  };

  return (
    <FormField
      //   control={control}
      name={`extra_costs.${extraCostIndex}.unit_cost_${subIndex}.${quantityIndex}`}
      render={({ field }) => (
        <FormItem className="w-24">
          <FormControl>
            <Input
              {...field}
              type="number"
              step="0.01"
              value={field.value ?? ""}
              onChange={(e) => {
                field.onChange(
                  e.target.value === "" ? null : parseFloat(e.target.value)
                );
              }}
              className="text-right"
              placeholder="0.00"
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
