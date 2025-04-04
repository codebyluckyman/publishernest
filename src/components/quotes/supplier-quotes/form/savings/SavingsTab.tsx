
import { Control, useFormContext } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { useState } from "react";
import { InventorySavings } from "./InventorySavings";
import { NonInventorySavings } from "./NonInventorySavings";
import { useSavingsManagement } from "@/hooks/useSavingsManagement";

interface SavingsTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function SavingsTab({ control, quoteRequest }: SavingsTabProps) {
  const form = useFormContext<SupplierQuoteFormValues>();
  
  const {
    findFieldIndex,
    groupSavingsByType,
    getFormatPriceBreaks
  } = useSavingsManagement({
    control,
    quoteRequest,
    form
  });

  if (!quoteRequest.savings || quoteRequest.savings.length === 0) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <h3 className="text-lg font-medium">No Savings</h3>
        <p className="text-muted-foreground mt-2">
          This quote request does not have any savings defined.
        </p>
      </div>
    );
  }

  // Group savings by unit of measure type
  const { inventorySavings, nonInventorySavings } = groupSavingsByType();

  return (
    <div className="space-y-6">
      {inventorySavings.length > 0 && (
        <InventorySavings 
          inventorySavings={inventorySavings}
          quoteRequest={quoteRequest}
          control={control}
          findFieldIndex={findFieldIndex}
          form={form}
        />
      )}

      {nonInventorySavings.length > 0 && (
        <NonInventorySavings 
          nonInventorySavings={nonInventorySavings}
          findFieldIndex={findFieldIndex}
          control={control}
          form={form}
        />
      )}
    </div>
  );
}
