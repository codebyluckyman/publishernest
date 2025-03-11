
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SupplierQuote, QuoteItem } from "@/types/quote";
import { QuoteRequest } from "@/types/quoteRequest";
import { QuoteRequestSelection } from "./QuoteRequestSelection";
import { SupplierInfoFields } from "./SupplierInfoFields";
import { DateFields } from "./DateFields";
import { StatusAndCurrencyFields } from "./StatusAndCurrencyFields";
import { NotesField } from "./NotesField";
import { QuoteItemsSection } from "./QuoteItemsSection";
import { quoteSchema, QuoteFormValues } from "./quoteFormSchema";
import { Organization } from "@/types/organization";
import { Supplier } from "@/types/supplier";

interface QuoteFormProps {
  quote?: SupplierQuote;
  onSubmit: (data: QuoteFormValues) => void;
  isSubmitting: boolean;
  quoteRequests: Pick<QuoteRequest, 'id' | 'title' | 'status'>[];
  quoteRequestId: string | null;
  setQuoteRequestId: (id: string | null) => void;
  currentOrganization: Organization | null;
}

export function QuoteForm({ 
  quote, 
  onSubmit, 
  isSubmitting, 
  quoteRequests, 
  quoteRequestId, 
  setQuoteRequestId,
  currentOrganization 
}: QuoteFormProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      supplier_id: quote?.supplier_id || null,
      supplier_name: quote?.supplier_name || "",
      contact_email: quote?.contact_email || "",
      contact_phone: quote?.contact_phone || "",
      quote_number: quote?.quote_number || "",
      quote_date: quote?.quote_date ? new Date(quote.quote_date) : new Date(),
      valid_until: quote?.valid_until ? new Date(quote.valid_until) : null,
      currency_code: quote?.currency_code || "USD",
      status: quote?.status || "pending",
      notes: quote?.notes || "",
      total_amount: quote?.total_amount || 0,
      items: quote?.items?.map(item => ({
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      })) || [{ product_id: null, description: '', quantity: 1, unit_price: 0, subtotal: 0 }],
    },
  });

  // Calculate subtotals and total when quantities or prices change
  const items = form.watch("items");
  
  useEffect(() => {
    const updatedItems = items.map(item => ({
      ...item,
      subtotal: (item.quantity || 0) * (item.unit_price || 0)
    }));
    
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    
    form.setValue("items", updatedItems);
    form.setValue("total_amount", totalAmount);
  }, [items.map(item => `${item.quantity}-${item.unit_price}`).join(",")]);

  const handleSupplierSelect = (supplier: Supplier | null) => {
    setSelectedSupplier(supplier);
    if (supplier) {
      form.setValue("supplier_name", supplier.supplier_name);
    }
  };

  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [
      ...currentItems,
      { product_id: null, description: '', quantity: 1, unit_price: 0, subtotal: 0 }
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      form.setValue("items", currentItems.filter((_, i) => i !== index));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quote Request Selection */}
          <QuoteRequestSelection 
            quoteRequests={quoteRequests}
            quoteRequestId={quoteRequestId}
            setQuoteRequestId={setQuoteRequestId}
          />

          {/* Supplier Information Fields */}
          <SupplierInfoFields 
            form={form} 
            currentOrganization={currentOrganization}
            onSupplierSelect={handleSupplierSelect}
          />

          {/* Date Fields */}
          <DateFields form={form} />

          {/* Status and Currency Fields */}
          <StatusAndCurrencyFields form={form} />
        </div>

        {/* Notes Field */}
        <NotesField form={form} />

        {/* Quote Items Section */}
        <QuoteItemsSection 
          form={form}
          addItem={addItem}
          removeItem={removeItem}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {quote ? 'Update Quote' : 'Create Quote'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
