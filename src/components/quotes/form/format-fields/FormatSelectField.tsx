
import { useState } from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { QuoteRequestFormValues } from "../schema";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FormatSelectFieldProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
  formats: FormatForSelect[];
  isLoading: boolean;
}

export function FormatSelectField({
  control,
  index,
  formats,
  isLoading,
}: FormatSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  // Transform formats data for the combobox
  const formatOptions = formats.map(format => ({
    label: format.format_name,
    value: format.id
  }));

  return (
    <FormField
      control={control}
      name={`formats.${index}.format_id`}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Format</FormLabel>
          <FormControl>
            {isLoading ? (
              <div className="flex items-center h-10 px-3 py-2 border rounded-md">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span className="text-sm">Loading formats...</span>
              </div>
            ) : (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? formatOptions.find(
                            (option) => option.value === field.value
                          )?.label
                        : "Select a format"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search formats..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No format found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {formatOptions.map((formatOptions) => (
                          <CommandItem
                            key={formatOptions.value}
                            value={formatOptions.label}
                            onSelect={(currentValue) => {
                              setValue(currentValue.value);
                              field.onChange(fcurrentValue.value);
                              setOpen(false);
                            }}
                          >
                            {formatOptions.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                field.value === formatOptions.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>  
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
