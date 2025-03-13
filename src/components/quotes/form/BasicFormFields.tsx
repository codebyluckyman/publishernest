
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Supplier } from "@/types/supplier";
import { QuoteRequestFormValues } from "./schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
            <Select
              onValueChange={(value) => {
                // Check if value already exists in the array
                if (!field.value.includes(value)) {
                  field.onChange([...field.value, value]);
                }
              }}
            >
              <FormControl>
                <SelectTrigger className={cn(
                  "w-full",
                  !field.value?.length && "text-muted-foreground"
                )}>
                  <SelectValue placeholder="Select suppliers" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {suppliers && suppliers.length > 0 && suppliers.map((supplier) => (
                  <SelectItem 
                    key={supplier.id} 
                    value={supplier.id}
                    disabled={field.value.includes(supplier.id)}
                  >
                    {supplier.supplier_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.value.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map(supplierId => {
                  const supplier = suppliers.find(s => s.id === supplierId);
                  return (
                    <Badge key={supplierId} variant="secondary" className="flex items-center gap-1">
                      {supplier?.supplier_name || 'Unknown'}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => {
                          field.onChange(field.value.filter(id => id !== supplierId));
                        }}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
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
        name="due_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Due Date</FormLabel>
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
