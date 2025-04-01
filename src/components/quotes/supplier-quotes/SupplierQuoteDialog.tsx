import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuoteRequest } from "@/types/quoteRequest";
import { useEffect, useState } from "react";
import { SupplierQuoteForm } from "./SupplierQuoteForm";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { useOrganization } from "@/context/OrganizationContext";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SupplierQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteRequest: QuoteRequest;
}

export function SupplierQuoteDialog({ open, onOpenChange, quoteRequest }: SupplierQuoteDialogProps) {
  const { currentOrganization } = useOrganization();
  const { useCreateSupplierQuote, useSubmitSupplierQuote } = useSupplierQuotes();
  const createMutation = useCreateSupplierQuote();
  const submitMutation = useSubmitSupplierQuote();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [submissionType, setSubmissionType] = useState<'draft' | 'submit'>('draft');
  const [currentFormData, setCurrentFormData] = useState<SupplierQuoteFormValues | null>(null);

  // Initialize the form with the selected supplier
  useEffect(() => {
    if (open && quoteRequest) {
      if (quoteRequest.supplier_id) {
        setSelectedSupplierId(quoteRequest.supplier_id);
      } else if (quoteRequest.supplier_ids && quoteRequest.supplier_ids.length > 0) {
        setSelectedSupplierId(quoteRequest.supplier_ids[0]);
      }
    } else {
      // Reset state when closing dialog
      setCreatedQuoteId(null);
    }
  }, [open, quoteRequest]);

  // Initialize production schedule based on quote request required step
  const getInitialProductionSchedule = () => {
    if (quoteRequest.production_schedule_requested && 
        quoteRequest.required_step_id && 
        quoteRequest.required_step_date) {
      // Create a production schedule object with the required step date
      return {
        [quoteRequest.required_step_id]: quoteRequest.required_step_date
      };
    }
    return {};
  };

  const handleSubmit = (data: SupplierQuoteFormValues) => {
    if (!currentOrganization) return;
    setCurrentFormData(data);
    
    if (submissionType === 'draft') {
      createMutation.mutate({
        formData: data,
        organizationId: currentOrganization.id
      }, {
        onSuccess: (id) => {
          setCreatedQuoteId(id);
          setHasUnsavedChanges(false);
        }
      });
    } else if (submissionType === 'submit' && createdQuoteId) {
      submitMutation.mutate({
        id: createdQuoteId,
        totalCost: 0 // This should be calculated or passed from the form
      }, {
        onSuccess: () => {
          setHasUnsavedChanges(false);
        }
      });
    }
  };

  const handleSubmitClick = () => {
    setSubmissionType('submit');
    if (currentFormData && createdQuoteId) {
      // If we already have a quote ID, submit it directly
      submitMutation.mutate({
        id: createdQuoteId,
        totalCost: 0 // This should be calculated or passed from the form
      }, {
        onSuccess: () => {
          setHasUnsavedChanges(false);
        }
      });
    } else if (currentFormData) {
      // Otherwise create and submit in sequence
      handleSubmit(currentFormData);
    }
  };

  const handleDraftSave = (data: SupplierQuoteFormValues) => {
    setSubmissionType('draft');
    handleSubmit(data);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && hasUnsavedChanges && !createdQuoteId) {
      // If trying to close with unsaved changes, show confirmation dialog
      setShowExitConfirmation(true);
    } else {
      // If no unsaved changes or closing after successful save, close normally
      onOpenChange(isOpen);
    }
  };

  const handleFormChange = (hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  };

  const confirmClose = () => {
    setShowExitConfirmation(false);
    setHasUnsavedChanges(false);
    onOpenChange(false);
  };

  const cancelClose = () => {
    setShowExitConfirmation(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[75vw] max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create Quote Response</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(95vh-8rem)]">
            <div className="p-1">
              <SupplierQuoteForm
                quoteRequest={quoteRequest}
                initialValues={{
                  quote_request_id: quoteRequest.id,
                  supplier_id: selectedSupplierId,
                  currency: quoteRequest.currency || "USD",
                  reference: "",
                  production_schedule: getInitialProductionSchedule()
                }}
                onSubmit={handleDraftSave}
                onFinalSubmit={handleSubmitClick}
                isSubmitting={createMutation.isPending || submitMutation.isPending}
                onCancel={() => handleOpenChange(false)}
                onSupplierChange={setSelectedSupplierId}
                createdQuoteId={createdQuoteId}
                onDone={() => onOpenChange(false)}
                onFormChange={handleFormChange}
                setCurrentFormData={setCurrentFormData}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you close this form, your changes will be lost. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose} className="bg-red-600 hover:bg-red-700">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
