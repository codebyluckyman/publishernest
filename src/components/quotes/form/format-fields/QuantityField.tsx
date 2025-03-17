
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QuoteRequestFormValues } from "../schema";

interface QuantityFieldProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
}

export function QuantityField({ control, index }: QuantityFieldProps) {
  return (
    <FormField
      control={control}
      name={`formats.${index}.quantity`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Quantity</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="1"
              {...field}
              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
