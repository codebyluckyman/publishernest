
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Supplier } from "@/types/supplier";
import { QuoteRequest } from "@/types/quoteRequest";

export interface SupplierSelectProps {
  control: Control<SupplierQuoteFormValues>;
  suppliers: Supplier[];
  isLoading: boolean;
  defaultSupplierId?: string;
  quoteRequest: QuoteRequest;
}

export function SupplierSelect({ control, suppliers, quoteRequest, isLoading, defaultSupplierId }: SupplierSelectProps) {
  // Filter suppliers to only those in the quote request
  const filteredSuppliers = suppliers.filter(supplier => {
    // Check if it's in the supplier_ids array
    if (quoteRequest.supplier_ids && quoteRequest.supplier_ids.length > 0) {
      return quoteRequest.supplier_ids.includes(supplier.id);
    }
    // For backward compatibility, also check single supplier_id
    if (quoteRequest.supplier_id) {
      return supplier.id === quoteRequest.supplier_id;
    }
    return false;
  });

  return (
    <FormField
      control={control}
      name="supplier_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Supplier</FormLabel>
          <FormControl>
            <Select
              disabled={isLoading || filteredSuppliers.length === 0}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading suppliers..." : "Select supplier"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSuppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.supplier_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
