
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { useFormContext } from "react-hook-form";
import { QuoteRequestFormValues } from "./schema";
import { Supplier } from "@/types/supplier";
import { MultipleSupplierSelect } from "./format-fields/MultipleSupplierSelect";
import { Textarea } from "@/components/ui/textarea";
import { ListOrdered, Pilcrow } from "lucide-react";

interface BasicFormFieldsProps {
  titleReadOnly?: boolean;
  suppliers?: Supplier[];
}

export const BasicFormFields = ({ titleReadOnly, suppliers = [] }: BasicFormFieldsProps) => {
  const form = useFormContext<QuoteRequestFormValues>();
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quote Name*</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter a name for this quote request" readOnly={titleReadOnly} />
            </FormControl>
            <FormDescription>
              A descriptive name to identify this quote request
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="supplier_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Suppliers*</FormLabel>
            <FormControl>
              <MultipleSupplierSelect
                suppliers={suppliers}
                value={field.value || []}
                onChange={field.onChange}
              />
            </FormControl>
            <FormDescription>
              Select one or more suppliers to request quotes from
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <DatePicker 
                  date={field.value ? new Date(field.value) : undefined}
                  setDate={(date) => field.onChange(date)}
                />
              </FormControl>
              <FormDescription>
                When suppliers should respond by
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reference_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter internal reference (optional)" />
              </FormControl>
              <FormDescription>
                Your internal reference code (if any)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Notes <span className="text-sm text-muted-foreground flex items-center gap-1"><ListOrdered className="h-4 w-4" /> <Pilcrow className="h-4 w-4" /></span>
            </FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Enter detailed notes about this quote request. You can use bullet points, numbering, and paragraphs for formatting."
                className="min-h-32"
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Add detailed information, requirements, or special instructions for this quote request
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
