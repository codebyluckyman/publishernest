import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Define option type for the dropdown items
export interface SelectOption {
  value: string;
  label: string;
}

// Define filter option types
export type FilterOption = "supplier" | "formats" | "quote_requests" | "users";

interface QuoteFiltersProps {
  filterOption: FilterOption;
  options: SelectOption[];
  value: string;
  isLoading?: boolean;
  onChange: (value: string) => void;
}

export default function QuoteFilters({
  filterOption,
  options,
  value,
  isLoading = false,
  onChange,
}: QuoteFiltersProps) {
  const [open, setOpen] = useState(false);

  // Get display name for the filter
  const getFilterDisplayName = () => {
    switch (filterOption) {
      case "supplier":
        return "Supplier";
      case "formats":
        return "Format";
      case "quote_requests":
        return "Quote Request";
      case "users":
        return "Users";
      default:
        return filterOption;
    }
  };

  // Handle selection of an option
  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    onChange(newValue);
    setOpen(false);
  };

  // Find the selected option
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="ml-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
            disabled={isLoading}
          >
            {selectedOption
              ? selectedOption.label
              : `Select ${getFilterDisplayName()}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput
              placeholder={`Search ${getFilterDisplayName().toLowerCase()}...`}
            />
            <CommandList>
              <CommandEmpty>
                No {getFilterDisplayName().toLowerCase()} found.
              </CommandEmpty>
              {isLoading ? (
                <CommandItem disabled>Loading...</CommandItem>
              ) : (
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={handleSelect}
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
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
