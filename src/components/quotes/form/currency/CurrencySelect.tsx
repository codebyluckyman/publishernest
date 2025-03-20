
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { QuoteRequestFormValues } from "@/types/quoteRequest";

const CURRENCIES = [
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "CNY", label: "Chinese Yuan (CNY)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "HKD", label: "Hong Kong Dollar (HKD)" },
  { value: "NZD", label: "New Zealand Dollar (NZD)" },
  { value: "USD", label: "US Dollar (USD)" },
];

export function CurrencySelect() {
  const { control } = useFormContext<QuoteRequestFormValues>();

  return (
    <FormField
      control={control}
      name="currency"
      defaultValue="USD"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>Quote Currency</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
