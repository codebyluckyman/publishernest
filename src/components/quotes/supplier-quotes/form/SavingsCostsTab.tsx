
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Control, UseFormReturn } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { ExtraCostsSection } from "./SavingsCostsTab/ExtraCostsSection";
import { SavingsSection } from "./SavingsCostsTab/SavingsSection";
import { useExtraCosts } from "@/hooks/useExtraCosts";
import { useSavings } from "@/hooks/useSavings";
import { useOrganization } from "@/context/OrganizationContext";

interface SavingsCostsTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
  form: UseFormReturn<SupplierQuoteFormValues>;
}

export function SavingsCostsTab({ control, quoteRequest, form }: SavingsCostsTabProps) {
  const { currentOrganization } = useOrganization();
  const { extraCosts } = useExtraCosts();
  const { savings } = useSavings(currentOrganization?.id);

  // Get extra costs from the quote request
  const extraCostsData = quoteRequest.extra_costs || [];
  
  // Get savings from the quote request
  const savingsData = quoteRequest.savings || [];
  
  return (
    <div className="space-y-6">
      <ExtraCostsSection extraCostsData={extraCostsData} />
      <SavingsSection savingsData={savingsData} />
    </div>
  );
}
