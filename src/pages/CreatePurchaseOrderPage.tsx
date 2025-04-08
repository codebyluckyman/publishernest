
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, TrashIcon } from "lucide-react";
import { format } from "date-fns";
import { useSuppliers } from "@/hooks/useSuppliers";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useOrganization } from "@/context/OrganizationContext";
import { cn } from "@/lib/utils";
import { PrintRunSelectCombobox } from "@/components/purchase-orders/PrintRunSelectCombobox";
import { SupplierQuoteSelectCombobox } from "@/components/purchase-orders/SupplierQuoteSelectCombobox";
import { CreatePrintRunDialog } from "@/components/purchase-orders/CreatePrintRunDialog";

// Define schema for the form
const formSchema = z.object({
  print_run_id: z.string().min(1, "Print run is required"),
  supplier_id: z.string().min(1, "Supplier is required"),
  supplier_quote_id: z.string().optional(),
  issue_date: z.date().optional(),
  delivery_date: z.date().optional(),
  shipping_address: z.string().optional(),
  shipping_method: z.string().optional(),
  payment_terms: z.string().optional(),
  currency: z.string().default("USD"),
  notes: z.string().optional(),
  line_items: z
    .array(
      z.object({
        product_id: z.string().min(1, "Product is required"),
        format_id: z.string().optional(),
        quantity: z
          .number({ required_error: "Quantity is required" })
          .int()
          .positive(),
      })
    )
    .min(1, "At least one product is required"),
});

export default function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { suppliers } = useSuppliers();
  const { useCreatePurchaseOrder } = usePurchaseOrders();
  const createMutation = useCreatePurchaseOrder();
  
  const [isCreatePrintRunOpen, setIsCreatePrintRunOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "USD",
      line_items: [{ quantity: 1000 }],
    },
  });
  
  const watchSupplierId = form.watch("supplier_id");

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate(values, {
      onSuccess: (purchaseOrder) => {
        navigate(`/purchase-orders/${purchaseOrder.id}`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for this purchase order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="print_run_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Print Run</FormLabel>
                        <PrintRunSelectCombobox
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormDescription>
                          Select the print run for this purchase order
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatePrintRunOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Print Run
                </Button>
              </div>

              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.supplier_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the supplier for this purchase order
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_quote_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Quote (Optional)</FormLabel>
                    <SupplierQuoteSelectCombobox
                      value={field.value || ""}
                      onChange={field.onChange}
                      supplierId={watchSupplierId || ""}
                    />
                    <FormDescription>
                      Link this purchase order to an approved supplier quote
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="issue_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue Date</FormLabel>
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the purchase order is issued
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Delivery Date</FormLabel>
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Expected delivery date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="shipping_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter shipping address"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="shipping_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Method</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Sea, Air, Road"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Net 30, 50% advance"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Textarea
                        placeholder="Enter any additional notes or instructions"
                        className="resize-none"
                        {...field}
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
              <CardDescription>
                Add products to this purchase order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Note: In the full implementation, you would select products and formats here.
                For this demonstration, a placeholder line item will be created.
              </p>

              {/* This would be populated with actual product and format selection components */}
              <div className="border p-4 rounded-md mb-4 bg-gray-50">
                <p className="text-center text-muted-foreground">
                  Product and format selection would be implemented here
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  // In full implementation, this would add another line item
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Another Product
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/purchase-orders')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Purchase Order"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      <CreatePrintRunDialog
        open={isCreatePrintRunOpen}
        onOpenChange={setIsCreatePrintRunOpen}
        onSuccess={(printRunId) => {
          form.setValue("print_run_id", printRunId);
        }}
      />
    </div>
  );
}
