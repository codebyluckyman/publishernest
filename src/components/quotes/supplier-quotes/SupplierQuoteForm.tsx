
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { QuoteDetailsSection } from "./form/QuoteDetailsSection";
import { PriceBreaksSection } from "./form/PriceBreaksSection";
import { ExtraCostsSection } from "./form/ExtraCostsSection";
import { SavingsSection } from "./form/SavingsSection";
import { NotesSection } from "./form/NotesSection";
import { SupplierSelect } from "./form/SupplierSelect";
import { QuoteRequest } from "@/types/quoteRequest";
import { useOrganization } from "@/context/OrganizationContext";
import { useSuppliers } from "@/hooks/useSuppliers";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { SupplierQuoteAttachments } from "./SupplierQuoteAttachments";
import { useExtraCosts } from "@/hooks/useExtraCosts";
import { useSavings } from "@/hooks/useSavings";
import { Supplier } from "@/types/supplier";

// Create a schema for form validation
const formSchema = z.object({
  quote_request_id: z.string(),
  supplier_id: z.string(),
  notes: z.string().optional(),
  currency: z.string(),
  price_breaks: z.array(
    z.object({
      quote_request_format_id: z.string(),
      price_break_id: z.string(),
      quantity: z.number(),
      product_id: z.string().optional(),
      unit_cost: z.number().nullable(),
    })
  ),
  extra_costs: z.array(
    z.object({
      extra_cost_id: z.string(),
      unit_cost: z.number().nullable(),
      notes: z.string().optional(),
    })
  ),
  savings: z.array(
    z.object({
      saving_id: z.string(),
      unit_cost: z.number().nullable(),
      notes: z.string().optional(),
    })
  ),
  reference: z.string().optional(),
  valid_from: z.string().optional(),
  valid_to: z.string().optional(),
  terms: z.string().optional(),
  remarks: z.string().optional(),
});

interface SupplierQuoteFormProps {
  quoteRequest: QuoteRequest;
  initialValues: SupplierQuoteFormValues;
  onSubmit: (data: SupplierQuoteFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  onSupplierChange: (supplierId: string) => void;
  createdQuoteId: string | null;
  onDone?: () => void;
}

export function SupplierQuoteForm({
  quoteRequest,
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
  onSupplierChange,
  createdQuoteId,
  onDone
}: SupplierQuoteFormProps) {
  const { currentOrganization } = useOrganization();
  const { suppliers, isLoading: loadingSuppliers } = useSuppliers(currentOrganization?.id);
  const [activeTab, setActiveTab] = useState("details");
  const { extraCosts } = useExtraCosts();
  const { savings } = useSavings();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Set up the form with react-hook-form and explicitly cast the type for type safety
  const form = useForm<SupplierQuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues as SupplierQuoteFormValues,
  });

  // When the supplier changes, call the parent handler
  useEffect(() => {
    const supplierId = form.watch("supplier_id");
    if (supplierId) {
      onSupplierChange(supplierId);
      // Update selected supplier
      const supplier = suppliers?.find(s => s.id === supplierId) || null;
      setSelectedSupplier(supplier);
    }
  }, [form.watch("supplier_id"), onSupplierChange, suppliers]);

  // Set up price breaks when formats are available
  useEffect(() => {
    if (quoteRequest.formats && quoteRequest.formats.length > 0) {
      // Only set up price breaks if none exist yet
      const currentPriceBreaks = form.getValues("price_breaks");
      if (currentPriceBreaks.length === 0) {
        const priceBreaksToAdd: any[] = [];
        
        quoteRequest.formats.forEach((format) => {
          format.price_breaks?.forEach((priceBreak) => {
            const productId = format.products && format.products.length > 0 
              ? format.products[0].product_id 
              : undefined;
              
            priceBreaksToAdd.push({
              quote_request_format_id: format.id,
              price_break_id: priceBreak.id,
              quantity: priceBreak.quantity,
              product_id: productId,
              unit_cost: null,
            });
          });
        });
        
        if (priceBreaksToAdd.length > 0) {
          form.setValue("price_breaks", priceBreaksToAdd);
        }
      }
    }
  }, [quoteRequest.formats, form]);

  // Handle form submission
  const handleSubmit = (data: SupplierQuoteFormValues) => {
    onSubmit(data);
  };

  // Show attachment management section if a quote has been created
  if (createdQuoteId) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-green-600">Quote created successfully!</h2>
          <p className="text-muted-foreground">Your quote has been saved as a draft. You can now manage attachments.</p>
        </div>
        
        <Card className="p-4">
          <SupplierQuoteAttachments 
            supplierQuote={{ id: createdQuoteId }} 
          />
        </Card>
        
        <div className="flex justify-center mt-6">
          <Button onClick={onDone} className="w-full md:w-auto">Done</Button>
        </div>
      </div>
    );
  }

  // Define currency options
  const currencies = [
    { label: "USD - US Dollar", value: "USD" },
    { label: "EUR - Euro", value: "EUR" },
    { label: "GBP - British Pound", value: "GBP" },
    { label: "CAD - Canadian Dollar", value: "CAD" },
    { label: "AUD - Australian Dollar", value: "AUD" },
    { label: "JPY - Japanese Yen", value: "JPY" },
    { label: "CNY - Chinese Yuan", value: "CNY" },
    { label: "SEK - Swedish Krona", value: "SEK" },
    { label: "DKK - Danish Krone", value: "DKK" },
    { label: "NOK - Norwegian Krone", value: "NOK" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic info and supplier selection */}
        <div className="space-y-4">
          <div className="border rounded-md p-4 bg-muted/20">
            <div className="font-medium mb-2">Quote Request: {quoteRequest.title}</div>
            <div className="text-sm text-muted-foreground">{quoteRequest.description}</div>
          </div>
          
          <SupplierSelect 
            control={form.control}
            suppliers={suppliers || []} 
            isLoading={loadingSuppliers}
            defaultSupplierId={quoteRequest.supplier_id}
            quoteRequest={quoteRequest}
          />
        </div>
        
        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="costs">Extra Costs</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <Card className="p-6">
              <QuoteDetailsSection form={form} currencies={currencies} />
            </Card>
            
            <Card className="p-6">
              <NotesSection control={form.control} />
            </Card>
          </TabsContent>
          
          <TabsContent value="pricing">
            <Card className="p-6">
              <PriceBreaksSection 
                control={form.control} 
                quoteRequest={quoteRequest}
                selectedSupplier={selectedSupplier}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="costs">
            <Card className="p-6">
              <ExtraCostsSection 
                control={form.control} 
                extraCosts={extraCosts} 
                currency={form.watch("currency")} 
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="savings">
            <Card className="p-6">
              <SavingsSection 
                control={form.control} 
                savings={savings} 
                currency={form.watch("currency")} 
              />
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Submit and cancel buttons */}
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
