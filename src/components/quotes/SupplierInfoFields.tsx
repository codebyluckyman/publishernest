
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { QuoteFormValues } from "./quoteFormSchema";

interface SupplierInfoFieldsProps {
  form: UseFormReturn<QuoteFormValues>;
}

export function SupplierInfoFields({ form }: SupplierInfoFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="supplier_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Supplier Name</FormLabel>
            <FormControl>
              <Input placeholder="Supplier name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contact_email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Email</FormLabel>
            <FormControl>
              <Input placeholder="contact@example.com" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contact_phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Phone</FormLabel>
            <FormControl>
              <Input placeholder="+1 (555) 123-4567" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="quote_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quote Number</FormLabel>
            <FormControl>
              <Input placeholder="QT-12345" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
