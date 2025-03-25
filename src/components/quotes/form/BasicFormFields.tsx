
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MultipleSupplierSelect } from "./format-fields/MultipleSupplierSelect";
import { CurrencySelect } from "./currency/CurrencySelect";
import { DatePicker } from "@/components/ui/date-picker";
import { QuoteRequestFormValues } from "./schema";
import { Supplier } from "@/types/supplier";

interface BasicFormFieldsProps {
  form: UseFormReturn<QuoteRequestFormValues>;
  suppliers: Supplier[];
  titleReadOnly?: boolean;
}

export function BasicFormFields({ form, suppliers, titleReadOnly = false }: BasicFormFieldsProps) {
  return (
    <Card>
      <CardContent className="pt-6 grid gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  disabled={titleReadOnly}
                  className={titleReadOnly ? "bg-muted" : ""}
                  placeholder={titleReadOnly ? "Will be set based on selected formats" : "Enter quote request title"} 
                />
              </FormControl>
              {titleReadOnly && (
                <p className="text-xs text-muted-foreground mt-1">
                  Title will be automatically generated based on selected formats
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter description" className="resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-1">
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    onSelect={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-1">
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <CurrencySelect
                    value={field.value || "USD"}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="supplier_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suppliers</FormLabel>
              <FormControl>
                <MultipleSupplierSelect
                  suppliers={suppliers}
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter notes" className="resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
