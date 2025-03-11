
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { QuoteFormValues } from "./quoteFormSchema";
import { Organization } from "@/types/organization";
import { SupplierSelection } from "./SupplierSelection";
import { Supplier } from "@/types/supplier";

interface SupplierInfoFieldsProps {
  form: UseFormReturn<QuoteFormValues>;
  currentOrganization: Organization | null;
  onSupplierSelect: (supplier: Supplier | null) => void;
}

export function SupplierInfoFields({ form, currentOrganization, onSupplierSelect }: SupplierInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <SupplierSelection 
        form={form} 
        currentOrganization={currentOrganization} 
        onSupplierSelect={onSupplierSelect}
      />

      <FormField
        control={form.control}
        name="contact_email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Email</FormLabel>
            <FormControl>
              <Input {...field} type="email" value={field.value || ""} />
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
              <Input {...field} type="tel" value={field.value || ""} />
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
              <Input {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
