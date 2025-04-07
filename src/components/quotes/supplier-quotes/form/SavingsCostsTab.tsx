
import { Control, UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { QuoteRequest } from "@/types/quoteRequest";
import { ExtraCostsSection } from "./SavingsCostsTab/ExtraCostsSection";
import { SavingsSection } from "./SavingsCostsTab/SavingsSection";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { useEffect } from "react";

interface SavingsCostsTabProps {
  control: Control<any>;
  quoteRequest: QuoteRequest;
  form: UseFormReturn<SupplierQuoteFormValues>;
}

export function SavingsCostsTab({ control, quoteRequest, form }: SavingsCostsTabProps) {
  // Debug output
  useEffect(() => {
    console.log("SavingsCostsTab - quoteRequest.savings:", quoteRequest.savings);
    console.log("SavingsCostsTab - form values savings:", form.getValues().savings);
  }, [quoteRequest, form]);

  return (
    <div className="space-y-6">
      <ExtraCostsSection 
        extraCostsData={quoteRequest.extra_costs || []} 
      />
      
      <SavingsSection 
        savingsData={quoteRequest.savings || []} 
      />
    </div>
  );
}
