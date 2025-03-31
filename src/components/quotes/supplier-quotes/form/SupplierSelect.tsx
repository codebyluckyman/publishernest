
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Supplier } from "@/types/supplier";
import { QuoteRequest } from "@/types/quoteRequest";
import { ExistingQuoteDialog } from "./ExistingQuoteDialog";
import { useOrganization } from "@/context/OrganizationContext";
import { checkExistingQuote } from "@/api/supplierQuotes";
import { toast } from "sonner";

export interface SupplierSelectProps {
  control: Control<SupplierQuoteFormValues>;
  suppliers: Supplier[];
  isLoading: boolean;
  defaultSupplierId?: string;
  quoteRequest: QuoteRequest;
  onExistingQuoteFound?: (quoteId: string) => void;
}

export function SupplierSelect({ 
  control, 
  suppliers, 
  quoteRequest, 
  isLoading, 
  defaultSupplierId,
  onExistingQuoteFound 
}: SupplierSelectProps) {
  const { currentOrganization } = useOrganization();
  const [showExistingQuoteDialog, setShowExistingQuoteDialog] = useState(false);
  const [existingQuoteId, setExistingQuoteId] = useState<string | null>(null);
  const [pendingSupplierChange, setPendingSupplierChange] = useState<string | null>(null);

  // Filter suppliers to only those in the quote request
  const filteredSuppliers = suppliers.filter(supplier => {
    // Check if it's in the supplier_ids array
    if (quoteRequest.supplier_ids && quoteRequest.supplier_ids.length > 0) {
      return quoteRequest.supplier_ids.includes(supplier.id);
    }
    // For backward compatibility, also check single supplier_id
    if (quoteRequest.supplier_id) {
      return supplier.id === quoteRequest.supplier_id;
    }
    return false;
  });

  const handleSupplierChange = async (supplierId: string, onChange: (value: string) => void) => {
    if (!currentOrganization) return;
    
    try {
      const result = await checkExistingQuote(
        quoteRequest.id,
        supplierId,
        currentOrganization.id
      );
      
      if (result.exists && result.quoteId) {
        setExistingQuoteId(result.quoteId);
        setPendingSupplierChange(supplierId);
        setShowExistingQuoteDialog(true);
        
        if (onExistingQuoteFound) {
          onExistingQuoteFound(result.quoteId);
        }
      } else {
        // No existing quote, proceed with change
        onChange(supplierId);
      }
    } catch (error) {
      console.error("Error checking for existing quote:", error);
      toast.error("Error checking for existing quotes");
      // Still proceed with the change on error
      onChange(supplierId);
    }
  };

  const handleContinueNew = () => {
    if (pendingSupplierChange && control) {
      // Apply the pending supplier change
      control._formValues.supplier_id = pendingSupplierChange;
      // Force rerender - fix the type error by using the correct structure
      control._subjects.state.next({
        name: "supplier_id",
        values: { ...control._formValues }
      });
    }
    setPendingSupplierChange(null);
  };

  return (
    <>
      <FormField
        control={control}
        name="supplier_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Supplier</FormLabel>
            <FormControl>
              <Select
                disabled={isLoading || filteredSuppliers.length === 0}
                value={field.value}
                onValueChange={(value) => handleSupplierChange(value, field.onChange)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading suppliers..." : "Select supplier"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSuppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.supplier_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {existingQuoteId && (
        <ExistingQuoteDialog
          open={showExistingQuoteDialog}
          onOpenChange={setShowExistingQuoteDialog}
          quoteId={existingQuoteId}
          onContinueNew={handleContinueNew}
        />
      )}
    </>
  );
}
