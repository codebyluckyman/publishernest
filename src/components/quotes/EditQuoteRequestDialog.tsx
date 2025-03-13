
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
  // Convert the QuoteRequest to form values
  const mapQuoteRequestToFormValues = (request: QuoteRequest): QuoteRequestFormValues => {
    return {
      id: request.id,
      title: request.title,
      supplier_ids: request.supplier_ids || (request.supplier_id ? [request.supplier_id] : []),
      description: request.description || "",
      due_date: request.due_date ? new Date(request.due_date) : undefined,
      notes: request.notes || "",
      // Ensure formats are properly mapped from the database
      formats: request.formats?.map(format => ({
        format_id: format.format_id,
        quantity: format.quantity,
        notes: format.notes || ""
      })) || [],
      products: request.products || {},
      quantities: request.quantities || {},
      supplier_id: request.supplier_id || undefined
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
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Quote Request</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-1 flex-grow">
          {quoteRequest && (
            <QuoteRequestForm 
              suppliers={suppliers} 
              initialValues={mapQuoteRequestToFormValues(quoteRequest)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onCancel={handleCancel}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
