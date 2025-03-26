import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { QuoteRequest } from "@/types/quoteRequest";
import { useOrganization } from "@/context/OrganizationContext";
import { useSuppliers } from "@/hooks/useSuppliers";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Supplier } from "@/types/supplier";
import { ExtraCostTableItem } from "@/types/extraCost";
import { SavingTableItem } from "@/types/saving";
import { useExtraCosts } from "@/hooks/useExtraCosts";
import { useSavings } from "@/hooks/useSavings";
import { FormHeader } from "./form/FormHeader";
import { FormTabs } from "./form/FormTabs";
import { FormActions } from "./form/FormActions";
import { SuccessView } from "./form/SuccessView";

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
  production_schedule: z.record(z.string(), z.string().nullable()).optional(),
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
  const [filteredExtraCosts, setFilteredExtraCosts] = useState<ExtraCostTableItem[]>([]);
  const [filteredSavings, setFilteredSavings] = useState<SavingTableItem[]>([]);

  useEffect(() => {
    if (extraCosts && quoteRequest.extra_costs) {
      const quoteRequestExtraCostIds = quoteRequest.extra_costs.map(cost => cost.id);
      const filtered = extraCosts.filter(cost => 
        quoteRequestExtraCostIds.includes(cost.id)
      );
      
      console.log("Filtered Extra Costs:", filtered);
      setFilteredExtraCosts(filtered);
    } else {
      setFilteredExtraCosts([]);
    }

    if (savings && quoteRequest.savings) {
      const quoteRequestSavingIds = quoteRequest.savings.map(saving => saving.id);
      const filtered = savings.filter(saving => 
        quoteRequestSavingIds.includes(saving.id)
      );
      
      console.log("Filtered Savings:", filtered);
      setFilteredSavings(filtered);
    } else {
      setFilteredSavings([]);
    }
  }, [extraCosts, savings, quoteRequest]);

  useEffect(() => {
    if (
      quoteRequest.production_schedule_requested &&
      quoteRequest.required_step_id &&
      quoteRequest.required_step_date
    ) {
      console.log("Setting schedule with required step:", quoteRequest.required_step_id, 
        "step name:", quoteRequest.required_step_name,
        "date:", quoteRequest.required_step_date);
      
      const initialSchedule = {
        [quoteRequest.required_step_id]: quoteRequest.required_step_date
      };
      
      form.setValue("production_schedule", initialSchedule);
    }
  }, [quoteRequest.required_step_id, quoteRequest.required_step_date, quoteRequest.production_schedule_requested]);

  const form = useForm<SupplierQuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues as SupplierQuoteFormValues,
  });

  useEffect(() => {
    const supplierId = form.watch("supplier_id");
    if (supplierId) {
      onSupplierChange(supplierId);
      const supplier = suppliers?.find(s => s.id === supplierId) || null;
      setSelectedSupplier(supplier);
    }
  }, [form.watch("supplier_id"), onSupplierChange, suppliers]);

  useEffect(() => {
    if (quoteRequest.formats && quoteRequest.formats.length > 0) {
      if (form.getValues("price_breaks").length === 0) {
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

  const handleSubmit = (data: SupplierQuoteFormValues) => {
    onSubmit(data);
  };

  if (createdQuoteId) {
    return <SuccessView createdQuoteId={createdQuoteId} onDone={onDone} />;
  }

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
        <FormHeader 
          quoteRequest={quoteRequest}
          suppliers={suppliers}
          loadingSuppliers={loadingSuppliers}
          form={form}
        />
        
        <FormTabs 
          control={form.control}
          quoteRequest={quoteRequest}
          selectedSupplier={selectedSupplier}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredExtraCosts={filteredExtraCosts}
          filteredSavings={filteredSavings}
          currencies={currencies}
          form={form}
        />
        
        <FormActions 
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          isValid={form.formState.isValid}
        />
      </form>
    </Form>
  );
}
