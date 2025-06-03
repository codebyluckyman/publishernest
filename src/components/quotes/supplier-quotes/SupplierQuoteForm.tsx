import { Form } from "@/components/ui/form";
import { QuoteRequest } from "@/types/quoteRequest";
import { useOrganization } from "@/context/OrganizationContext";
import { useSuppliers } from "@/hooks/useSuppliers";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { FormHeader } from "./form/FormHeader";
import { FormTabs } from "./form/FormTabs";
import { FormActions } from "./form/FormActions";
import { SuccessView } from "./form/SuccessView";
import { useSupplierQuoteForm } from "@/hooks/useSupplierQuoteForm";

interface SupplierQuoteFormProps {
  quoteRequest: QuoteRequest;
  initialValues: SupplierQuoteFormValues;
  onSubmit: (data: SupplierQuoteFormValues) => void;
  onFinalSubmit?: () => void;
  isSubmitting: boolean;
  onCancel: () => void;
  onSupplierChange: (supplierId: string) => void;
  createdQuoteId: string | null;
  onDone?: () => void;
  onFormChange?: (hasChanges: boolean) => void;
  setCurrentFormData?: (data: SupplierQuoteFormValues) => void;
  mode?: "create" | "edit";
}

export function SupplierQuoteForm({
  quoteRequest,
  initialValues,
  onSubmit,
  onFinalSubmit,
  isSubmitting,
  onCancel,
  onSupplierChange,
  createdQuoteId,
  onDone,
  onFormChange,
  setCurrentFormData,
  mode = "create",
}: SupplierQuoteFormProps) {
  const { currentOrganization } = useOrganization();
  const { suppliers, isLoading: loadingSuppliers } = useSuppliers(
    currentOrganization?.id
  );

  const {
    form,
    activeTab,
    setActiveTab,
    selectedSupplier,
    setSelectedSupplier,
    isFormComplete,
    currencies,
  } = useSupplierQuoteForm({
    quoteRequest,
    initialValues,
    onSupplierChange,
    onFormChange,
    setCurrentFormData,
    createdQuoteId,
    mode,
  });

  // Update selected supplier when suppliers are loaded
  if (suppliers && !selectedSupplier) {
    const supplierId = form.watch("supplier_id");
    if (supplierId) {
      const supplier = suppliers.find((s) => s.id === supplierId) || null;
      setSelectedSupplier(supplier);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = form.getValues();
    onSubmit(formData);
  };

  // Show success view if quote has been created
  if (mode === "create" && createdQuoteId) {
    return (
      <SuccessView
        createdQuoteId={createdQuoteId}
        onDone={onDone}
        onSubmit={onFinalSubmit}
        isSubmitReady={isFormComplete}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        <FormHeader
          quoteRequest={quoteRequest}
          suppliers={suppliers}
          loadingSuppliers={loadingSuppliers}
          form={form}
        />

        <FormTabs
          control={form.control}
          quoteRequest={quoteRequest}
          selectedSupplier={selectedSupplier}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currencies={currencies}
          form={form}
          mode={mode}
        />

        <FormActions
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          isValid={form.formState.isValid}
          mode={mode}
        />
      </form>
    </Form>
  );
}
