
// Update the FormHeader to support edit mode
import { Control } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface FormHeaderProps {
  quoteRequest: QuoteRequest;
  suppliers: Supplier[] | undefined;
  loadingSuppliers: boolean;
  form: any;
  mode?: 'create' | 'edit';
}

export function FormHeader({ quoteRequest, suppliers, loadingSuppliers, form, mode = 'create' }: FormHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Quote Request: {quoteRequest.title}</h3>
          <p className="text-sm text-muted-foreground">{quoteRequest.reference_id}</p>
          {quoteRequest.description && (
            <p className="mt-1 text-sm">{quoteRequest.description}</p>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Supplier Selection - only editable in create mode */}
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                {loadingSuppliers ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={mode === 'edit'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.supplier_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormItem>
            )}
          />
          
          {/* Reference field */}
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Reference (optional)</FormLabel>
                <Input placeholder="e.g. PO-12345" {...field} value={field.value || ''} />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
