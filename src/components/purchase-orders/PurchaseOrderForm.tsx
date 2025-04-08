
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePrintRuns } from "@/hooks/usePrintRuns";
import { useOrganization } from "@/hooks/useOrganization";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { LineItemsTable } from "./LineItemsTable";
import { Calendar, Save, Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const formSchema = z.object({
  printRunId: z.string().uuid({ message: "Please select a print run" }),
  supplierId: z.string().uuid({ message: "Please select a supplier" }).optional(),
  supplierQuoteId: z.string().uuid().optional(),
  currency: z.string().min(1, { message: "Please enter a currency" }),
  issueDate: z.date().optional(),
  deliveryDate: z.date().optional(),
  notes: z.string().optional(),
  shippingAddress: z.string().optional(),
  shippingMethod: z.string().optional(),
  lineItems: z.array(
    z.object({
      id: z.string().optional(),
      product_id: z.string().uuid(),
      format_id: z.string().uuid().optional(),
      quantity: z.number().min(1),
      unit_cost: z.number().min(0),
      total_cost: z.number().min(0),
      supplier_id: z.string().uuid().optional(),
      supplier_quote_id: z.string().uuid().optional(),
      isNew: z.boolean().optional(),
      isDeleted: z.boolean().optional(),
    })
  ).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PurchaseOrderFormProps {
  initialData?: any;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  mode?: 'create' | 'edit';
}

export function PurchaseOrderForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  mode = 'create'
}: PurchaseOrderFormProps) {
  const { currentOrganization } = useOrganization();
  const { printRuns, isLoading: isPrintRunsLoading } = usePrintRuns();
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [supplierMismatchError, setSupplierMismatchError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      currency: "USD",
      lineItems: [],
    },
  });

  const handleFormSubmit = (values: FormValues) => {
    const formData = {
      ...values,
      lineItems: lineItems.filter(item => !item.isDeleted),
    };
    onSubmit(formData);
  };

  const handleLineItemsChange = (items: any[]) => {
    setLineItems(items);
    form.setValue('lineItems', items);
    
    // Reset supplier mismatch error when items change
    setSupplierMismatchError(null);
  };
  
  const handleSupplierSelect = (supplierId: string) => {
    // Check if a different supplier is selected in other line items
    const otherSuppliers = lineItems
      .filter(item => item.supplier_id && item.supplier_id !== supplierId)
      .map(item => item.supplier_id);
    
    if (otherSuppliers.length > 0) {
      setSupplierMismatchError(
        "Warning: You've selected items from different suppliers. All items should be from the same supplier."
      );
    } else {
      setSupplierMismatchError(null);
      form.setValue('supplierId', supplierId);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {supplierMismatchError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{supplierMismatchError}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="printRunId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Print Run</FormLabel>
                <Select
                  disabled={isSubmitting || isPrintRunsLoading}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Print Run" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {printRuns?.map((printRun) => (
                      <SelectItem key={printRun.id} value={printRun.id}>
                        {printRun.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Issue Date</FormLabel>
                <DatePicker 
                  date={field.value} 
                  onSelect={field.onChange}
                  setDate={field.onChange}
                  disabled={isSubmitting}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deliveryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Delivery Date</FormLabel>
                <DatePicker 
                  date={field.value} 
                  onSelect={field.onChange} 
                  setDate={field.onChange}
                  disabled={isSubmitting}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shippingMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Method</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="shippingAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping Address</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  disabled={isSubmitting}
                  value={field.value || ''}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <h3 className="text-lg font-medium mb-4">Line Items</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add products to this purchase order. Select a product to automatically associate
            its format and choose from available supplier quotes.
          </p>
          <LineItemsTable 
            items={lineItems} 
            onChange={handleLineItemsChange} 
            onSupplierSelect={handleSupplierSelect}
            disabled={isSubmitting}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  disabled={isSubmitting}
                  value={field.value || ''}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || (supplierMismatchError !== null && lineItems.length > 0)}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {mode === 'create' ? 'Create Purchase Order' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
