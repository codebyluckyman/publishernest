
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomerSelector } from '@/components/sales-orders/CustomerSelector';
import { LineItemsTable } from '@/components/sales-orders/LineItemsTable';
import { ChargesTable } from '@/components/sales-orders/ChargesTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { SalesOrderLineItem, SalesOrderCharge } from '@/types/salesOrder';
import { useAuth } from '@/context/AuthContext';
import { DatePicker } from '@/components/ui/date-picker';

// Schema for form validation
const salesOrderSchema = z.object({
  customerId: z.string().uuid({ message: 'Please select a customer' }),
  printRunId: z.string().uuid().optional(),
  currency: z.string().min(1, { message: 'Currency is required' }),
  taxRate: z.number().min(0).default(0),
  paymentTerms: z.string().optional(),
  deliveryDate: z.date().optional(),
  notes: z.string().optional(),
});

type SalesOrderFormValues = z.infer<typeof salesOrderSchema> & {
  lineItems: Omit<SalesOrderLineItem, 'id' | 'sales_order_id' | 'created_at' | 'updated_at'>[];
  charges: Omit<SalesOrderCharge, 'id' | 'sales_order_id' | 'created_at' | 'updated_at'>[];
};

interface SalesOrderFormProps {
  onSubmit: (data: SalesOrderFormValues) => Promise<void>;
  defaultValues?: Partial<SalesOrderFormValues>;
}

export function SalesOrderForm({ onSubmit, defaultValues }: SalesOrderFormProps) {
  const { user } = useAuth();
  
  const form = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      currency: 'USD',
      taxRate: 0,
      lineItems: [],
      charges: [],
      ...defaultValues,
    }
  });
  
  const [lineItems, setLineItems] = React.useState<Omit<SalesOrderLineItem, 'id' | 'sales_order_id' | 'created_at' | 'updated_at'>[]>(
    defaultValues?.lineItems || []
  );
  
  const [charges, setCharges] = React.useState<Omit<SalesOrderCharge, 'id' | 'sales_order_id' | 'created_at' | 'updated_at'>[]>(
    defaultValues?.charges || []
  );
  
  const handleFormSubmit = async (data: SalesOrderFormValues) => {
    try {
      // Calculate totals for the form data
      const totalAmount = lineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
      const taxAmount = totalAmount * (data.taxRate / 100);
      const chargesTotal = charges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
      const grandTotal = totalAmount + taxAmount + chargesTotal;
      
      // Include line items and charges in the submission
      await onSubmit({
        ...data,
        lineItems,
        charges,
      });
      
    } catch (error) {
      console.error('Error submitting sales order:', error);
      toast.error('Failed to create sales order. Please try again.');
    }
  };
  
  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <CustomerSelector control={form.control} />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="USD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <FormControl>
                      <Input placeholder="Net 30" {...field} value={field.value || ''} />
                    </FormControl>
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
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <LineItemsTable 
                items={lineItems} 
                onItemsChange={setLineItems} 
                currency={form.watch('currency')} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <ChargesTable 
                charges={charges} 
                onChargesChange={setCharges} 
                currency={form.watch('currency')} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any notes or special instructions for this sales order"
                        className="min-h-32" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Create Sales Order
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
