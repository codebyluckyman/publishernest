
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { QuoteRequestForm } from "./QuoteRequestForm";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
import { useOrganization } from "@/hooks/useOrganization";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { toast } from "sonner";

interface CreateQuoteRequestFromFormatProps {
  formatId: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
  buttonText?: string;
  buttonIcon?: boolean;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onSuccess?: () => void;
}

export function CreateQuoteRequestFromFormat({ 
  formatId,
  buttonVariant = "default",
  buttonText = "Create Quote Request",
  buttonIcon = true,
  buttonSize = "sm",
  className,
  onSuccess
}: CreateQuoteRequestFromFormatProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { useCreateQuoteRequest, useFetchSuppliers } = useQuoteRequests();
  const createMutation = useCreateQuoteRequest();
  const { data: suppliers = [], isLoading: isSuppliersLoading } = useFetchSuppliers();

  const handleSubmit = (formData: QuoteRequestFormValues) => {
    // Log the form data to debug
    console.log("Submitting form data:", formData);
    
    if (currentOrganization) {
      createMutation.mutate(
        {
          formData,
          organizationId: currentOrganization.id,
        },
        {
          onSuccess: () => {
            setOpen(false);
            toast.success("Quote request created successfully");
            navigate("/quote-requests");
            if (onSuccess) onSuccess();
          },
        }
      );
    }
  };

  // Pre-fill the form with the selected format
  const initialValues: Partial<QuoteRequestFormValues> = {
    formats: [
      {
        format_id: formatId,
        quantity: 1,
        notes: "",
      },
    ],
  };

  return (
    <>
      <Button 
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
          // Don't call onSuccess here, as it will close the parent dropdown
          // AND close the dialog we're trying to open
          // if (onSuccess) onSuccess(); <- This was causing the dialog to close immediately
        }} 
        variant={buttonVariant} 
        size={buttonSize}
        className={className}
        title="Create Quote Request"
      >
        {buttonIcon && <FileText className="h-4 w-4 mr-2" />}
        {buttonText}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Create Quote Request</DialogTitle>
            <DialogDescription>
              Create a new quote request using this format.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-1 flex-grow">
            {isSuppliersLoading ? (
              <div className="p-8 text-center">Loading suppliers...</div>
            ) : (
              <QuoteRequestForm 
                suppliers={suppliers} 
                initialValues={initialValues}
                onSubmit={handleSubmit} 
                onCancel={() => setOpen(false)} 
                isSubmitting={createMutation.isPending}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
