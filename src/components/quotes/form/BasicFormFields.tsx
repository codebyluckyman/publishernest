
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Supplier } from "@/types/supplier";
import { QuoteRequestFormValues } from "./schema";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface BasicFormFieldsProps {
  control: Control<QuoteRequestFormValues>;
  suppliers: Supplier[];
}

export function BasicFormFields({ control, suppliers }: BasicFormFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Quote request title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="supplier_ids"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Suppliers</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      !field.value?.length && "text-muted-foreground"
                    )}
                  >
                    {Array.isArray(field.value) && field.value.length > 0
                      ? `${field.value.length} supplier${field.value.length > 1 ? "s" : ""} selected`
                      : "Select suppliers"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search suppliers..." />
                  <CommandEmpty>No supplier found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup className="max-h-60 overflow-auto">
                      {suppliers && suppliers.length > 0 && suppliers.map((supplier) => (
                        <CommandItem
                          value={supplier.supplier_name}
                          key={supplier.id}
                          onSelect={() => {
                            const currentValues = Array.isArray(field.value) ? field.value : [];
                            const isSelected = currentValues.includes(supplier.id);
                            
                            if (isSelected) {
                              field.onChange(currentValues.filter((id) => id !== supplier.id));
                            } else {
                              field.onChange([...currentValues, supplier.id]);
                            }
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value && Array.isArray(field.value) && field.value.includes(supplier.id) 
                                ? "opacity-100" 
                                : "opacity-0"
                            )}
                          />
                          {supplier.supplier_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Detailed description of the quote request" 
                className="min-h-[120px]" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="expected_delivery_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Expected Delivery Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
