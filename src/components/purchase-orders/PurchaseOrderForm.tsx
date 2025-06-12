import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePrintRuns } from "@/hooks/usePrintRuns";
import { useOrganization } from "@/hooks/useOrganization";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Save, Loader2, X } from "lucide-react";
import { PurchaseOrderLineItemsTable } from "./PurchaseOrderLineItemsTable";
import { NewPurchaseOrderLineItem } from "@/types/purchaseOrderLineItem";
import { useSuppliers } from "@/hooks/useSuppliers";

const formSchema = z.object({
  printRunId: z.string().uuid({ message: "Please select a print run" }),
  supplierId: z
    .string()
    .uuid({ message: "Please select a supplier" })
    .optional(),
  currency: z.string().min(1, { message: "Please enter a currency" }),
  issueDate: z.date().optional(),
  deliveryDate: z.date().optional(),
  notes: z.string().optional(),
  shippingAddress: z.string().optional(),
  shippingMethod: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PurchaseOrderFormProps {
  initialData?: any;
  onSubmit: (
    data: FormValues & { lineItems: NewPurchaseOrderLineItem[] }
  ) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  mode?: "create" | "edit";
}

export function PurchaseOrderForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  mode = "create",
}: PurchaseOrderFormProps) {
  const { currentOrganization } = useOrganization();
  const { printRuns, isLoading: isPrintRunsLoading } = usePrintRuns();
  const { suppliers, isLoading: isSuppliersLoading } = useSuppliers();
  const [lineItems, setLineItems] = useState<NewPurchaseOrderLineItem[]>(
    initialData?.lineItems || []
  );
  const [lockSupplier, setLockSupplier] = useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      currency: "USD",
      supplierId: undefined,
    },
  });

  // When a supplier is selected from a line item, update the supplier field
  const handleSupplierChange = (supplierId: string) => {
    if (!form.getValues("supplierId")) {
      form.setValue("supplierId", supplierId);
      setLockSupplier(true);
    }
  };

  const handleFormSubmit = (values: FormValues) => {
    console.log("lineItems===", lineItems);
    onSubmit({ ...values, lineItems });
  };

  // Calculate total cost of all line items
  const calculateTotalCost = () => {
    return lineItems.reduce((total, item) => total + (item.total_cost || 0), 0);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
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
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Select
                  disabled={isSubmitting || isSuppliersLoading || lockSupplier}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.supplier_name}
                      </SelectItem>
                    ))}
                    {suppliers?.length === 0 && (
                      <SelectItem value="none" disabled>
                        No suppliers available
                      </SelectItem>
                    )}
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
                <FormLabel className="mt-2 mb-[2px]">Issue Date</FormLabel>
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
                <FormLabel className="mt-2 mb-[2px]">Delivery Date</FormLabel>
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
                  value={field.value || ""}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Line Items</h3>
          <PurchaseOrderLineItemsTable
            items={lineItems}
            onItemsChange={setLineItems}
            currency={form.watch("currency")}
            onSupplierChange={handleSupplierChange}
            supplierId={form.watch("supplierId")}
          />
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <div>
            <p className="text-sm font-medium">Total Cost</p>
            <p className="text-xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: form.watch("currency") || "USD",
              }).format(calculateTotalCost())}
            </p>
          </div>
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
                  value={field.value || ""}
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {mode === "create" ? "Create Purchase Order" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
