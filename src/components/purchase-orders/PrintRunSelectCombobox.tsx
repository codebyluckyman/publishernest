
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
import { PrintRun } from "@/types/printRun";
import { usePrintRuns } from "@/hooks/usePrintRuns";
import { useOrganization } from "@/context/OrganizationContext";

interface PrintRunSelectComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PrintRunSelectCombobox({
  value,
  onChange,
  disabled = false,
}: PrintRunSelectComboboxProps) {
  const [open, setOpen] = useState(false);
  const { currentOrganization } = useOrganization();
  
  const { usePrintRunsList } = usePrintRuns();
  const { data: printRuns, isLoading } = usePrintRunsList("active");

  const options = printRuns
    ? printRuns.map((printRun: PrintRun) => ({
        value: printRun.id,
        label: printRun.title,
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
          disabled={disabled}
        >
          {selectedValue ? selectedValue.label : "Select Print Run"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search print runs..." />
          <CommandEmpty>
            {isLoading
              ? "Loading..."
              : "No active print runs found. Create one first."}
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
