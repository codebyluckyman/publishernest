import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuoteRequest } from "@/types/quoteRequest";
import { useEffect, useState } from "react";
import { SupplierQuoteForm } from "./SupplierQuoteForm";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { useOrganization } from "@/context/OrganizationContext";
import { SupplierQuote, SupplierQuoteFormValues } from "@/types/supplierQuote";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SupplierQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteRequest: any;
  // quoteRequest: QuoteRequest;
  existingQuote?: SupplierQuote | null;
  mode?: "create" | "edit";
}

export function SupplierQuoteDialog({
  open,
  onOpenChange,
  quoteRequest,
  existingQuote = null,
  mode = "create",
}: SupplierQuoteDialogProps) {
  const { currentOrganization } = useOrganization();
  const {
    useCreateSupplierQuote,
    useSubmitSupplierQuote,
    useUpdateSupplierQuote,
  } = useSupplierQuotes();
  const createMutation = useCreateSupplierQuote();
  const updateMutation = useUpdateSupplierQuote();
  const submitMutation = useSubmitSupplierQuote();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [submissionType, setSubmissionType] = useState<"draft" | "submit">(
    "draft"
  );
  const [currentFormData, setCurrentFormData] =
    useState<SupplierQuoteFormValues | null>(null);

  // Initialize the form with the selected supplier or existing quote data
  useEffect(() => {
    if (open && quoteRequest) {
      if (mode === "edit" && existingQuote) {
        setSelectedSupplierId(existingQuote.supplier_id);
      } else if (quoteRequest.supplier_id) {
        setSelectedSupplierId(quoteRequest.supplier_id);
      } else if (
        quoteRequest.supplier_ids &&
        quoteRequest.supplier_ids.length > 0
      ) {
        setSelectedSupplierId(quoteRequest.supplier_ids[0]);
      }
    } else {
      // Reset state when closing dialog
      if (!open) {
        setCreatedQuoteId(null);
      }
    }
  }, [open, quoteRequest, existingQuote, mode]);

  // Initialize production schedule based on quote request required step
  const getInitialProductionSchedule = () => {
    if (existingQuote && existingQuote.production_schedule) {
      return existingQuote.production_schedule;
    } else if (
      quoteRequest.production_schedule_requested &&
      quoteRequest.required_step_id &&
      quoteRequest.required_step_date
    ) {
      // Create a production schedule object with the required step date
      return {
        [quoteRequest.required_step_id]: quoteRequest.required_step_date,
      };
    }
    return {};
  };

  const handleSubmit = (data: SupplierQuoteFormValues) => {
    if (!currentOrganization) return;
    setCurrentFormData(data);

    if (submissionType === "draft") {
      if (mode === "edit") {
        // Update existing quote
        updateMutation.mutate(
          {
            id: createdQuoteId,
            updates: data,
            previousData: existingQuote,
          },
          {
            onSuccess: () => {
              console.log(
                "Successfully updated supplier quote with ID:",
                createdQuoteId
              );
              setHasUnsavedChanges(false);
            },
          }
        );
      } else {
        // Create new quote
        createMutation.mutate(
          {
            formData: data,
            organizationId: currentOrganization.id,
          },
          {
            onSuccess: (id) => {
              console.log("Successfully created supplier quote with ID:", id);
              setCreatedQuoteId(id);
              setHasUnsavedChanges(false);
            },
          }
        );
      }
    } else if (submissionType === "submit" && createdQuoteId) {
      submitMutation.mutate(
        {
          id: createdQuoteId,
          totalCost: 0, // This should be calculated or passed from the form
        },
        {
          onSuccess: () => {
            console.log(
              "Successfully submitted supplier quote with ID:",
              createdQuoteId
            );
            setHasUnsavedChanges(false);
          },
        }
      );
    }
  };

  const handleSubmitClick = () => {
    setSubmissionType("submit");
    if (currentFormData && createdQuoteId) {
      // If we already have a quote ID, submit it directly
      submitMutation.mutate(
        {
          id: createdQuoteId,
          totalCost: 0, // This should be calculated or passed from the form
        },
        {
          onSuccess: () => {
            setHasUnsavedChanges(false);
          },
        }
      );
    } else if (currentFormData) {
      // Otherwise create and submit in sequence
      handleSubmit(currentFormData);
    }
  };

  const handleDraftSave = (data: SupplierQuoteFormValues) => {
    setSubmissionType("draft");
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
    console.log("handler form");
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

  // Prepare initial form values
  const getInitialValues = (): SupplierQuoteFormValues => {
    if (mode === "edit" && existingQuote) {
      return {
        id: existingQuote.id,
        quote_request_id: existingQuote.quote_request.id,
        status: existingQuote.status,
        supplier_id: existingQuote.supplier_id,
        price_breaks: existingQuote.price_breaks || [],
        currency: existingQuote.currency || "USD",
        reference: existingQuote.reference || "",
        notes: existingQuote.notes || "",
        valid_from: existingQuote.valid_from || undefined,
        valid_to: existingQuote.valid_to || undefined,
        terms: existingQuote.terms || "",
        remarks: existingQuote.remarks || "",
        production_schedule: getInitialProductionSchedule(),
        extra_costs: existingQuote.extra_costs || [],
        savings: existingQuote.savings || [],
        packaging_carton_quantity:
          existingQuote.packaging_carton_quantity || null,
        packaging_carton_weight: existingQuote.packaging_carton_weight || null,
        packaging_carton_length: existingQuote.packaging_carton_length || null,
        packaging_carton_width: existingQuote.packaging_carton_width || null,
        packaging_carton_height: existingQuote.packaging_carton_height || null,
        packaging_carton_volume: existingQuote.packaging_carton_volume || null,
        packaging_cartons_per_pallet:
          existingQuote.packaging_cartons_per_pallet || null,
        packaging_copies_per_20ft_palletized:
          existingQuote.packaging_copies_per_20ft_palletized || null,
        packaging_copies_per_40ft_palletized:
          existingQuote.packaging_copies_per_40ft_palletized || null,
        packaging_copies_per_20ft_unpalletized:
          existingQuote.packaging_copies_per_20ft_unpalletized || null,
        packaging_copies_per_40ft_unpalletized:
          existingQuote.packaging_copies_per_40ft_unpalletized || null,
      };
    }
    return {
      quote_request_id: quoteRequest.id,
      supplier_id: selectedSupplierId,
      price_breaks: [],
      currency: quoteRequest.currency || "USD",
      reference: "",
      production_schedule: getInitialProductionSchedule(),
      status: "draft",
    };
  };

  const dialogTitle =
    mode === "edit" ? "Edit Quote Response" : "Create Quote Response";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[75vw] max-h-[95vh] overflow-hidden stroke-dasharray">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[calc(95vh-8rem)]">
            <div className="p-1">
              <SupplierQuoteForm
                quoteRequest={quoteRequest}
                initialValues={getInitialValues()}
                onSubmit={handleDraftSave}
                onFinalSubmit={handleSubmitClick}
                isSubmitting={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  submitMutation.isPending
                }
                onCancel={() => handleOpenChange(false)}
                onSupplierChange={setSelectedSupplierId}
                createdQuoteId={createdQuoteId}
                onDone={() => onOpenChange(false)}
                onFormChange={handleFormChange}
                setCurrentFormData={setCurrentFormData}
                mode={mode}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showExitConfirmation}
        onOpenChange={setShowExitConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you close this form, your changes
              will be lost. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClose}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
