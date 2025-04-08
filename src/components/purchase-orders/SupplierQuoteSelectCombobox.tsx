
import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { useOrganization } from "@/context/OrganizationContext";

interface SupplierQuoteSelectComboboxProps {
  value: string;
  onChange: (value: string) => void;
  supplierId: string;
  disabled?: boolean;
}

export function SupplierQuoteSelectCombobox({
  value,
  onChange,
  supplierId,
  disabled = false,
}: SupplierQuoteSelectComboboxProps) {
  const [open, setOpen] = useState(false);
  const { currentOrganization } = useOrganization();
  
  const { useSupplierQuotesList } = useSupplierQuotes();
  const { data: quotes, isLoading } = useSupplierQuotesList(
    currentOrganization,
    "approved", // Only approved quotes
    supplierId
  );

  const options = quotes
    ? quotes.map((quote) => ({
        value: quote.id,
        label: quote.reference || quote.reference_id || quote.id,
      }))
    : [];

  const selectedValue = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground"
          )}
          disabled={disabled || !supplierId}
        >
          {selectedValue ? selectedValue.label : supplierId ? "Select Quote" : "Select supplier first"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search quotes..." />
          <CommandEmpty>
            {isLoading
              ? "Loading..."
              : "No approved quotes found for this supplier."}
          </CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
