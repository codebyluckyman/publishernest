import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { SupplierQuoteFormValues, SupplierQuotePriceBreak, SupplierQuoteExtraCost } from "@/types/supplierQuote";

// Schema for price breaks
const priceBreakSchema = z.object({
  id: z.string().optional(),
  supplier_quote_id: z.string().optional(),
  quote_request_format_id: z.string(),
  price_break_id: z.string(),
  product_id: z.string().nullable().optional(),
  quantity: z.number(),
  unit_cost: z.number().nullable().optional(),
  unit_cost_1: z.number().nullable().optional(),
  unit_cost_2: z.number().nullable().optional(),
  unit_cost_3: z.number().nullable().optional(),
  unit_cost_4: z.number().nullable().optional(),
  unit_cost_5: z.number().nullable().optional(),
  unit_cost_6: z.number().nullable().optional(),
  unit_cost_7: z.number().nullable().optional(),
  unit_cost_8: z.number().nullable().optional(),
  unit_cost_9: z.number().nullable().optional(),
  unit_cost_10: z.number().nullable().optional(),
});

// Schema for extra costs
const extraCostSchema = z.object({
  id: z.string().optional(),
  supplier_quote_id: z.string().optional(),
  extra_cost_id: z.string(),
  unit_cost: z.number().nullable().optional(),
  unit_cost_1: z.number().nullable().optional(),
  unit_cost_2: z.number().nullable().optional(),
  unit_cost_3: z.number().nullable().optional(),
  unit_cost_4: z.number().nullable().optional(),
  unit_cost_5: z.number().nullable().optional(),
  unit_cost_6: z.number().nullable().optional(),
  unit_cost_7: z.number().nullable().optional(),
  unit_cost_8: z.number().nullable().optional(),
  unit_cost_9: z.number().nullable().optional(),
  unit_cost_10: z.number().nullable().optional(),
  unit_of_measure_id: z.string().nullable().optional(),
});

const formSchema = z.object({
  // Required foreign keys that can't be null
  quote_request_id: z.string(),
  supplier_id: z.string(),
  
  // All other fields are optional for draft save
  notes: z.string().optional(),
  currency: z.string().optional().default("USD"),
  reference: z.string().optional(),
  valid_from: z.string().optional(),
  valid_to: z.string().optional(),
  terms: z.string().optional(),
  remarks: z.string().optional(),
  production_schedule: z.record(z.string(), z.string().nullable()).optional(),
  
  // Price breaks
  price_breaks: z.array(priceBreakSchema).optional(),
  
  // Extra costs - added this
  extra_costs: z.array(extraCostSchema).optional(),
  
  // Packaging details - all optional
  packaging_carton_quantity: z.number().nullable().optional(),
  packaging_carton_weight: z.number().nullable().optional(),
  packaging_carton_length: z.number().nullable().optional(),
  packaging_carton_width: z.number().nullable().optional(),
  packaging_carton_height: z.number().nullable().optional(),
  packaging_carton_volume: z.number().nullable().optional(),
  packaging_cartons_per_pallet: z.number().nullable().optional(),
  packaging_copies_per_20ft_palletized: z.number().nullable().optional(),
  packaging_copies_per_40ft_palletized: z.number().nullable().optional(),
  packaging_copies_per_20ft_unpalletized: z.number().nullable().optional(),
  packaging_copies_per_40ft_unpalletized: z.number().nullable().optional(),
});

export function useSupplierQuoteForm({
  quoteRequest,
  initialValues,
  onSupplierChange,
  onFormChange,
  setCurrentFormData,
  createdQuoteId,
}: {
  quoteRequest: QuoteRequest;
  initialValues: SupplierQuoteFormValues;
  onSupplierChange: (supplierId: string) => void;
  onFormChange?: (hasChanges: boolean) => void;
  setCurrentFormData?: (data: SupplierQuoteFormValues) => void;
  createdQuoteId: string | null;
}) {
  const [activeTab, setActiveTab] = useState("details");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isFormComplete, setIsFormComplete] = useState(false);

  // Initialize extra costs if needed
  const extraCosts = initialValues.extra_costs || [];
  
  // Log current state of extra costs from initialValues (for debugging)
  console.log('Initial extra costs:', extraCosts);
  
  if (quoteRequest.extra_costs && quoteRequest.extra_costs.length > 0 && extraCosts.length === 0) {
    quoteRequest.extra_costs.forEach(extraCost => {
      // For inventory units, make sure we initialize all unit_cost fields
      const unitOfMeasure = quoteRequest.extra_costs
        .find(ec => ec.id === extraCost.id)?.unit_of_measures;
      
      const isInventoryUnit = unitOfMeasure?.is_inventory_unit || false;
      
      if (isInventoryUnit) {
        console.log(`Adding inventory unit extra cost: ${extraCost.name}`);
        extraCosts.push({
          extra_cost_id: extraCost.id,
          unit_cost: null,
          unit_cost_1: null,
          unit_cost_2: null,
          unit_cost_3: null,
          unit_cost_4: null,
          unit_cost_5: null,
          unit_cost_6: null,
          unit_cost_7: null,
          unit_cost_8: null,
          unit_cost_9: null,
          unit_cost_10: null,
          unit_of_measure_id: extraCost.unit_of_measure_id || null
        });
      } else {
        extraCosts.push({
          extra_cost_id: extraCost.id,
          unit_cost: null,
          unit_of_measure_id: extraCost.unit_of_measure_id || null
        });
      }
    });
  }

  const form = useForm<SupplierQuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialValues,
      price_breaks: initialValues.price_breaks || [],
      extra_costs: extraCosts,
      packaging_carton_quantity: initialValues.packaging_carton_quantity || null,
      packaging_carton_weight: initialValues.packaging_carton_weight || null,
      packaging_carton_length: initialValues.packaging_carton_length || null,
      packaging_carton_width: initialValues.packaging_carton_width || null,
      packaging_carton_height: initialValues.packaging_carton_height || null,
      packaging_carton_volume: initialValues.packaging_carton_volume || null,
      packaging_cartons_per_pallet: initialValues.packaging_cartons_per_pallet || null,
      packaging_copies_per_20ft_palletized: initialValues.packaging_copies_per_20ft_palletized || null,
      packaging_copies_per_40ft_palletized: initialValues.packaging_copies_per_40ft_palletized || null,
      packaging_copies_per_20ft_unpalletized: initialValues.packaging_copies_per_20ft_unpalletized || null,
      packaging_copies_per_40ft_unpalletized: initialValues.packaging_copies_per_40ft_unpalletized || null,
    },
  });

  // Log the form values for extra costs after initialization
  console.log('Extra costs after form initialization:', form.getValues('extra_costs'));

  // Set required production schedule steps if any
  useEffect(() => {
    if (quoteRequest.production_schedule_requested &&
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
  }, [quoteRequest.required_step_id, quoteRequest.required_step_date, quoteRequest.production_schedule_requested, form]);
  
  // Handle supplier changes
  useEffect(() => {
    const supplierId = form.watch("supplier_id");
    if (supplierId) {
      onSupplierChange(supplierId);
    }
  }, [form.watch("supplier_id"), onSupplierChange]);
  
  // Track form changes and completeness
  useEffect(() => {
    const subscription = form.watch(() => {
      // Check if form has changes
      if (onFormChange && form.formState.isDirty) {
        onFormChange(true);
      }
      
      // Store current form data
      if (setCurrentFormData) {
        setCurrentFormData(form.getValues());
      }
      
      // Check if form is valid for submission
      setIsFormComplete(createdQuoteId !== null);
    });
    
    return () => subscription.unsubscribe();
  }, [form, onFormChange, setCurrentFormData, createdQuoteId]);

  // Get common currency options
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

  return {
    form,
    activeTab,
    setActiveTab,
    selectedSupplier,
    setSelectedSupplier,
    isFormComplete,
    currencies
  };
}
