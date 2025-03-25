
import { useState, useEffect } from "react";
import { Supplier } from "@/types/supplier";
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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MultipleSupplierSelectProps {
  suppliers: Supplier[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function MultipleSupplierSelect({
  suppliers,
  value,
  onChange,
  disabled = false,
}: MultipleSupplierSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(value || []);

  // Sync with external value
  useEffect(() => {
    setSelectedItems(value || []);
  }, [value]);

  const handleSelect = (currentValue: string) => {
    const newSelectedItems = selectedItems.includes(currentValue)
      ? selectedItems.filter((item) => item !== currentValue)
      : [...selectedItems, currentValue];
    
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
  };

  const removeItem = (itemId: string) => {
    const newSelectedItems = selectedItems.filter((item) => item !== itemId);
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier ? supplier.supplier_name : supplierId;
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedItems.length > 0
              ? `${selectedItems.length} supplier${
                  selectedItems.length > 1 ? "s" : ""
                } selected`
              : "Select suppliers..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search suppliers..." />
            <CommandEmpty>No suppliers found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {suppliers.map((supplier) => (
                <CommandItem
                  key={supplier.id}
                  value={supplier.id}
                  onSelect={() => handleSelect(supplier.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedItems.includes(supplier.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {supplier.supplier_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedItems.map((itemId) => (
            <Badge key={itemId} variant="secondary" className="gap-1">
              {getSupplierName(itemId)}
              <button
                type="button"
                onClick={() => removeItem(itemId)}
                className="rounded-full outline-none focus:ring-2 focus:ring-ring"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {getSupplierName(itemId)}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
