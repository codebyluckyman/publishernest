
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface CurrencySelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CurrencySelect({ value, onValueChange }: CurrencySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
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
  );
}
