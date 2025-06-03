
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  emptyValue?: string;
  allOptionValue?: string; // New prop to identify the "All" option
}

export function MultiSelectFilter({
  options,
  value,
  onChange,
  placeholder,
  label,
  className,
  disabled = false,
  emptyValue,
  allOptionValue, // New prop
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(value || []);

  // Sync with external value
  useEffect(() => {
    setSelectedItems(value || []);
  }, [value]);

  const handleSelect = (currentValue: string) => {
    let newSelectedItems: string[];
    
    // If "All" option is clicked
    if (allOptionValue && currentValue === allOptionValue) {
      // If "All" is being selected, clear everything else
      newSelectedItems = [allOptionValue];
    } 
    // If a specific option is clicked and "All" is currently selected
    else if (allOptionValue && selectedItems.includes(allOptionValue)) {
      // Remove "All" and add the clicked option
      newSelectedItems = [currentValue];
    }
    // Normal case: toggle the clicked option
    else {
      if (selectedItems.includes(currentValue)) {
        // Remove item if already selected
        newSelectedItems = selectedItems.filter(item => item !== currentValue);
      } else {
        // Add item if not selected
        newSelectedItems = [...selectedItems, currentValue];
      }
    }
    
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems.length > 0 ? newSelectedItems : emptyValue ? [emptyValue] : []);
  };

  const removeItem = (itemValue: string) => {
    // If removing the last item, reset to "All" option
    let newSelectedItems = selectedItems.filter(item => item !== itemValue);
    
    if (newSelectedItems.length === 0 && allOptionValue) {
      newSelectedItems = [allOptionValue];
    }
    
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems.length > 0 ? newSelectedItems : emptyValue ? [emptyValue] : []);
  };

  const getOptionLabel = (itemValue: string) => {
    const option = options.find(opt => opt.value === itemValue);
    return option ? option.label : itemValue;
  };

  const clearAll = () => {
    const newSelectedItems = allOptionValue ? [allOptionValue] : [];
    setSelectedItems(newSelectedItems);
    onChange(emptyValue ? [emptyValue] : []);
  };

  // Don't show "All" option in the badges
  const displayBadges = selectedItems.filter(item => !allOptionValue || item !== allOptionValue);

  const displayValue = selectedItems.length > 0 
    ? `${displayBadges.length} selected`
    : placeholder;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium mb-1 block">{label}</label>
          {displayBadges.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAll}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            disabled={disabled}
          >
            <span className="truncate">{displayValue}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedItems.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {displayBadges.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {displayBadges.map((itemValue) => (
            <Badge key={itemValue} variant="secondary" className="gap-1">
              {getOptionLabel(itemValue)}
              <button
                type="button"
                onClick={() => removeItem(itemValue)}
                className="rounded-full outline-none focus:ring-2 focus:ring-ring"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {getOptionLabel(itemValue)}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
