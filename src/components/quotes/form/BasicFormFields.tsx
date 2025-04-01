
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { useFormContext } from "react-hook-form";
import { QuoteRequestFormValues } from "./schema";
import { Supplier } from "@/types/supplier";
import { MultipleSupplierSelect } from "./format-fields/MultipleSupplierSelect";

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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description*</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter a brief description" />
            </FormControl>
            <FormDescription>
              A short summary of what you're requesting a quote for
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

