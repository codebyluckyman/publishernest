import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuoteRequestForm } from "./QuoteRequestForm";
import { Supplier } from "@/types/supplier";
import { QuoteRequest, QuoteRequestFormValues } from "@/types/quoteRequest";
import { useOrganization } from "@/hooks/useOrganization";
import { useFormatsForSelect } from "@/hooks/useFormatsForSelect";

interface EditQuoteRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  quoteRequest: QuoteRequest | null;
  suppliers: Supplier[];
  onSubmit: (id: string, data: QuoteRequestFormValues) => void;
  isSubmitting: boolean;
}

export function EditQuoteRequestDialog({ 
  isOpen, 
  onOpenChange, 
  quoteRequest, 
  suppliers, 
  onSubmit,
  isSubmitting
}: EditQuoteRequestDialogProps) {
  const { currentOrganization } = useOrganization();
  
  // Prefetch formats when dialog is opened
  const { refetch: refetchFormats } = useFormatsForSelect();

  // Prefetch formats when dialog opens
  useEffect(() => {
    if (isOpen && currentOrganization) {
      refetchFormats();
    }
  }, [isOpen, currentOrganization, refetchFormats]);
  
  // Convert the QuoteRequest to form values
  const mapQuoteRequestToFormValues = (request: QuoteRequest): QuoteRequestFormValues => {
    // Debug the incoming savings data
    console.log("Mapping quote request to form values:", request);
    console.log("Savings from request:", request.savings);
    
    // Map savings from the database to the form format
    const mappedSavings = request.savings?.map(saving => ({
      name: saving.name,
      description: saving.description || "",
      unit_of_measure_id: saving.unit_of_measure_id || ""
    })) || [];
    
    console.log("Mapped savings for form:", mappedSavings);
    
    return {
      id: request.id,
      title: request.title || "", 
      supplier_ids: request.supplier_ids || (request.supplier_id ? [request.supplier_id] : []),
      description: request.description || "",
      due_date: request.due_date ? new Date(request.due_date) : undefined,
      notes: request.notes || "",
      // Ensure formats are properly mapped from the database
      formats: request.formats?.map(format => ({
        format_id: format.format_id,
        notes: format.notes || "",
        products: format.products || [],
        price_breaks: format.price_breaks || [],
        num_products: format.num_products
      })) || [],
      products: request.products || {},
      quantities: request.quantities || {},
      supplier_id: request.supplier_id || undefined,
      reference_id: request.reference_id,
      // Include extra costs
      extra_costs: request.extra_costs?.map(cost => ({
        name: cost.name,
        description: cost.description || "",
        unit_of_measure_id: cost.unit_of_measure_id || ""
      })) || [],
      // Include savings with proper mapping
      savings: mappedSavings,
      // Include currency
      currency: request.currency || "USD",
      // Include production schedule fields
      production_schedule_requested: request.production_schedule_requested,
      // Map the required step ID and date
      required_step_id: request.required_step_id || null,
      required_step_date: request.required_step_date ? new Date(request.required_step_date) : null
    };
  };

  const handleSubmit = (data: QuoteRequestFormValues) => {
    if (quoteRequest) {
      onSubmit(quoteRequest.id, data);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[75vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Edit Quote Request {quoteRequest?.reference_id && (
              <span className="text-muted-foreground font-mono text-sm ml-2">
                {quoteRequest.reference_id}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-1 flex-grow">
          {quoteRequest && (
            <QuoteRequestForm 
              suppliers={suppliers} 
              initialValues={mapQuoteRequestToFormValues(quoteRequest)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onCancel={handleCancel}
              hasFormats={quoteRequest.formats && quoteRequest.formats.length > 0}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
