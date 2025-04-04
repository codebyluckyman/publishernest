
import { Control, useFormContext } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { useState } from "react";
import { InventoryExtraCosts } from "./InventoryExtraCosts";
import { NonInventoryExtraCosts } from "./NonInventoryExtraCosts";
import { useExtraCostsManagement } from "@/hooks/useExtraCostsManagement";

interface ExtraCostsTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function ExtraCostsTab({ control, quoteRequest }: ExtraCostsTabProps) {
  const form = useFormContext<SupplierQuoteFormValues>();
  
  const {
    findFieldIndex,
    groupExtraCostsByType,
    getFormatPriceBreaks
  } = useExtraCostsManagement({
    control,
    quoteRequest,
    form
  });

  if (!quoteRequest.extra_costs || quoteRequest.extra_costs.length === 0) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <h3 className="text-lg font-medium">No Extra Costs</h3>
        <p className="text-muted-foreground mt-2">
          This quote request does not have any extra costs defined.
        </p>
      </div>
    );
  }

  // Group costs by unit of measure type
  const { inventoryCosts, nonInventoryCosts } = groupExtraCostsByType();

  return (
    <div className="space-y-6">
      {inventoryCosts.length > 0 && (
        <InventoryExtraCosts 
          inventoryCosts={inventoryCosts}
          quoteRequest={quoteRequest}
          control={control}
          findFieldIndex={findFieldIndex}
          form={form}
        />
      )}

      {nonInventoryCosts.length > 0 && (
        <NonInventoryExtraCosts 
          nonInventoryCosts={nonInventoryCosts}
          findFieldIndex={findFieldIndex}
          control={control}
          form={form}
        />
      )}
    </div>
  );
}
