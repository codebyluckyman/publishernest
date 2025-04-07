import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuoteRequest } from "@/types/quoteRequest";
import { useEffect, useState } from "react";
import { SupplierQuoteForm } from "./SupplierQuoteForm";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { useOrganization } from "@/context/OrganizationContext";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SuccessView } from "./form/SuccessView";

interface SupplierQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteRequest?: QuoteRequest;
  quoteRequestId?: string;
  quoteId?: string;
  supplierId?: string;
  mode?: 'create' | 'edit';
}

export function SupplierQuoteDialog({ 
  open, 
  onOpenChange, 
  quoteRequest, 
  quoteRequestId,
  quoteId,
  supplierId,
  mode = 'create'
}: SupplierQuoteDialogProps) {
  const { currentOrganization } = useOrganization();
  const { useCreateSupplierQuote, useUpdateSupplierQuote, useSubmitSupplierQuote, useSupplierQuoteById } = useSupplierQuotes();
  const createMutation = useCreateSupplierQuote();
  const updateMutation = useUpdateSupplierQuote();
  const submitMutation = useSubmitSupplierQuote();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(supplierId || "");
  const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(mode === 'edit' ? quoteId || null : null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [submissionType, setSubmissionType] = useState<'draft' | 'submit'>('draft');
  const [currentFormData, setCurrentFormData] = useState<SupplierQuoteFormValues | null>(null);
  const [loadedQuoteRequest, setLoadedQuoteRequest] = useState<QuoteRequest | null>(null);
  
  // Fetch the quote data if in edit mode
  const { data: quoteData, isLoading: isLoadingQuote } = useSupplierQuoteById(quoteId || null);

  // Initialize the form with the selected supplier
  useEffect(() => {
    if (open) {
      if (quoteRequest) {
        setLoadedQuoteRequest(quoteRequest);
        
        if (supplierId) {
          setSelectedSupplierId(supplierId);
        } else if (quoteRequest.supplier_id) {
          setSelectedSupplierId(quoteRequest.supplier_id);
        } else if (quoteRequest.supplier_ids && quoteRequest.supplier_ids.length > 0) {
          setSelectedSupplierId(quoteRequest.supplier_ids[0]);
        }
      } else if (quoteData && quoteData.quote_request) {
        setLoadedQuoteRequest(quoteData.quote_request as QuoteRequest);
        
        if (quoteData.supplier_id) {
          setSelectedSupplierId(quoteData.supplier_id);
        }
      }
    } else {
      if (mode === 'create') {
        setCreatedQuoteId(null);
      }
    }
  }, [open, quoteRequest, quoteData, mode, supplierId]);

  // Initialize production schedule based on quote request required step
  const getInitialProductionSchedule = () => {
    if (loadedQuoteRequest?.production_schedule_requested && 
        loadedQuoteRequest?.required_step_id && 
        loadedQuoteRequest?.required_step_date) {
      return {
        [loadedQuoteRequest.required_step_id]: loadedQuoteRequest.required_step_date
      };
    }
    return {};
  };

  const handleSubmit = (data: SupplierQuoteFormValues) => {
    if (!currentOrganization) return;
    setCurrentFormData(data);
    
    if (mode === 'edit' && quoteId) {
      // Update existing quote
      updateMutation.mutate({
        id: quoteId,
        updates: data,
        previousData: quoteData
      }, {
        onSuccess: () => {
          console.log('Successfully updated supplier quote with ID:', quoteId);
          setHasUnsavedChanges(false);
          if (submissionType === 'submit') {
            handleSubmitClick();
          }
        }
      });
    } else if (submissionType === 'draft') {
      // Create new quote
      createMutation.mutate({
        formData: data,
        organizationId: currentOrganization.id
      }, {
        onSuccess: (id) => {
          console.log('Successfully created supplier quote with ID:', id);
          setCreatedQuoteId(id);
          setHasUnsavedChanges(false);
          if (submissionType === 'submit') {
            submitMutation.mutate({
              id: id,
              totalCost: 0 // This should be calculated or passed from the form
            });
          }
        }
      });
    }
  };

  const handleSubmitClick = () => {
    setSubmissionType('submit');
    if (currentFormData) {
      if (mode === 'edit' && quoteId) {
        // If we're in edit mode and already saved changes, submit the quote
        submitMutation.mutate({
          id: quoteId,
          totalCost: 0 // This should be calculated or passed from the form
        }, {
          onSuccess: () => {
            setHasUnsavedChanges(false);
            onOpenChange(false); // Close the dialog after successful submission
          }
        });
      } else if (createdQuoteId) {
        // If we've already created the quote, submit it
        submitMutation.mutate({
          id: createdQuoteId,
          totalCost: 0 // This should be calculated or passed from the form
        }, {
          onSuccess: () => {
            setHasUnsavedChanges(false);
            onOpenChange(false); // Close the dialog after successful submission
          }
        });
      } else {
        // Otherwise save first then submit
        handleSubmit(currentFormData);
      }
    }
  };

  const handleDraftSave = (data: SupplierQuoteFormValues) => {
    setSubmissionType('draft');
    handleSubmit(data);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && hasUnsavedChanges && !createdQuoteId) {
      setShowExitConfirmation(true);
    } else {
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

  if ((mode === 'create' && !loadedQuoteRequest) || (mode === 'edit' && isLoadingQuote)) {
    return null;
  }

  // Determine whether to show the form or success view
  const showForm = mode === 'edit' || !createdQuoteId;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[75vw] max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Quote Response' : 'Edit Quote Response'}
            </DialogTitle>
          </DialogHeader>
          
          {loadedQuoteRequest && (
            <ScrollArea className="h-[calc(95vh-8rem)]">
              <div className="p-1">
                {showForm ? (
                  <SupplierQuoteForm
                    quoteRequest={loadedQuoteRequest}
                    initialValues={{
                      quote_request_id: loadedQuoteRequest.id,
                      supplier_id: selectedSupplierId,
                      price_breaks: [],
                      currency: loadedQuoteRequest.currency || "USD",
                      reference: "",
                      production_schedule: getInitialProductionSchedule(),
                      ...(quoteData ? {
                        notes: quoteData.notes || "",
                        currency: quoteData.currency || "USD",
                        reference: quoteData.reference || "",
                        valid_from: quoteData.valid_from || undefined,
                        valid_to: quoteData.valid_to || undefined,
                        terms: quoteData.terms || "",
                        remarks: quoteData.remarks || "",
                        production_schedule: quoteData.production_schedule || {},
                        price_breaks: quoteData.price_breaks || [],
                        extra_costs: quoteData.extra_costs || [],
                        savings: quoteData.savings || [],
                        packaging_carton_quantity: quoteData.packaging_carton_quantity,
                        packaging_carton_weight: quoteData.packaging_carton_weight,
                        packaging_carton_length: quoteData.packaging_carton_length,
                        packaging_carton_width: quoteData.packaging_carton_width,
                        packaging_carton_height: quoteData.packaging_carton_height,
                        packaging_carton_volume: quoteData.packaging_carton_volume,
                        packaging_cartons_per_pallet: quoteData.packaging_cartons_per_pallet,
                        packaging_copies_per_20ft_palletized: quoteData.packaging_copies_per_20ft_palletized,
                        packaging_copies_per_40ft_palletized: quoteData.packaging_copies_per_40ft_palletized,
                        packaging_copies_per_20ft_unpalletized: quoteData.packaging_copies_per_20ft_unpalletized,
                        packaging_copies_per_40ft_unpalletized: quoteData.packaging_copies_per_40ft_unpalletized
                      } : {})
                    }}
                    onSubmit={handleDraftSave}
                    onFinalSubmit={handleSubmitClick}
                    isSubmitting={createMutation.isPending || updateMutation.isPending || submitMutation.isPending}
                    onCancel={() => handleOpenChange(false)}
                    onSupplierChange={setSelectedSupplierId}
                    createdQuoteId={mode === 'create' ? createdQuoteId : quoteId}
                    onDone={() => onOpenChange(false)}
                    onFormChange={handleFormChange}
                    setCurrentFormData={setCurrentFormData}
                  />
                ) : (
                  <SuccessView 
                    createdQuoteId={createdQuoteId || ""} 
                    onDone={() => onOpenChange(false)} 
                    onSubmit={handleSubmitClick}
                    isSubmitReady={true}
                    isSubmitting={submitMutation.isPending}
                  />
                )}
              </div>
            </ScrollArea>
          )}
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
