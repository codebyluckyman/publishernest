
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SupplierSelect } from "./form/SupplierSelect";
import { PriceBreaksSection } from "./form/PriceBreaksSection";
import { ExtraCostsSection } from "./form/ExtraCostsSection";
import { SavingsSection } from "./form/SavingsSection";
import { NotesSection } from "./form/NotesSection";
import { QuoteDetailsSection } from "./form/QuoteDetailsSection";
import { useEffect, useState } from "react";
import { useSuppliersApi } from "@/hooks/useSuppliersApi";
import { useOrganization } from "@/context/OrganizationContext";
import { Supplier } from "@/types/supplier";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupplierQuoteAttachments } from "./SupplierQuoteAttachments";
import { toast } from "sonner";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Create schema for the supplier quote form
const supplierQuoteFormSchema = z.object({
  quote_request_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  price_breaks: z.array(z.object({
    quote_request_format_id: z.string().uuid(),
    price_break_id: z.string().uuid(),
    quantity: z.number(),
    product_id: z.string().uuid().optional(),
    unit_cost: z.number().nullable()
  })),
  extra_costs: z.array(z.object({
    extra_cost_id: z.string().uuid(),
    unit_cost: z.number().nullable(),
    notes: z.string().optional()
  })),
  savings: z.array(z.object({
    saving_id: z.string().uuid(),
    unit_cost: z.number().nullable(),
    notes: z.string().optional()
  })),
  notes: z.string().optional(),
  currency: z.string(),
  // New fields
  valid_from: z.string().optional(),
  valid_to: z.string().optional(),
  terms: z.string().optional(),
  remarks: z.string().optional()
});

interface SupplierQuoteFormProps {
  quoteRequest: QuoteRequest;
  initialValues: SupplierQuoteFormValues;
  onSubmit: (data: SupplierQuoteFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  onSupplierChange?: (supplierId: string) => void;
  createdQuoteId?: string | null;
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
  const suppliersApi = useSuppliersApi(currentOrganization);
  const { data: suppliers = [], isLoading: suppliersLoading } = suppliersApi;
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState("pricing");
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const form = useForm<SupplierQuoteFormValues>({
    resolver: zodResolver(supplierQuoteFormSchema),
    defaultValues: initialValues
  });

  // When supplier changes, update the appropriate fields
  useEffect(() => {
    const supplierId = form.watch("supplier_id");
    const supplierFound = suppliers.find(s => s.id === supplierId);
    setSelectedSupplier(supplierFound || null);
    
    if (onSupplierChange && supplierId) {
      onSupplierChange(supplierId);
    }
  }, [form.watch("supplier_id"), suppliers, onSupplierChange]);
  
  // Track when the quote is created and show the attachments tab
  useEffect(() => {
    if (createdQuoteId && !formSubmitted) {
      toast.success("Quote created successfully. You can now add attachments.");
      setFormSubmitted(true);
      setActiveTab("attachments");
    }
  }, [createdQuoteId, formSubmitted]);

  const handleFormSubmit = (data: SupplierQuoteFormValues) => {
    onSubmit(data);
  };

  // If the quote is created, show a different UI focusing on attachments
  if (formSubmitted && createdQuoteId) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>Quote Created Successfully</AlertTitle>
          <AlertDescription>
            Your quote has been created. You can now add attachments to this quote.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Add Attachments</h3>
          <p className="text-sm text-muted-foreground">
            Upload any supporting documents, price lists, or specifications for this quote.
          </p>
          
          <SupplierQuoteAttachments
            supplierQuote={{ id: createdQuoteId, attachments: [] } as any}
            onAttachmentsChange={() => {}}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" onClick={onDone}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Quote Request Information */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Quote Request: {quoteRequest.title}</h3>
          {quoteRequest.description && (
            <p className="text-sm text-muted-foreground mb-2">{quoteRequest.description}</p>
          )}
        </div>
        
        {/* Supplier Selection */}
        <SupplierSelect 
          control={form.control} 
          suppliers={suppliers}
          quoteRequest={quoteRequest}
          isLoading={suppliersLoading}
        />
        
        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="pricing">Pricing & Details</TabsTrigger>
            <TabsTrigger value="terms">Terms & Dates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pricing" className="space-y-6 pt-4">
            {/* Price Breaks */}
            <PriceBreaksSection 
              control={form.control}
              quoteRequest={quoteRequest}
              selectedSupplier={selectedSupplier}
            />
            
            {/* Extra Costs */}
            <ExtraCostsSection 
              control={form.control}
              quoteRequest={quoteRequest}
            />
            
            {/* Savings */}
            <SavingsSection 
              control={form.control}
              quoteRequest={quoteRequest}
            />
            
            {/* Notes */}
            <NotesSection control={form.control} />
          </TabsContent>
          
          <TabsContent value="terms" className="space-y-6 pt-4">
            {/* Quote Details Section with validity dates and terms */}
            <QuoteDetailsSection control={form.control} />
          </TabsContent>
        </Tabs>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Quote Response"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
