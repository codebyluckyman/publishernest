
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { QuoteRequestForm } from "./QuoteRequestForm";
import { Supplier } from "@/types/supplier";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
import { useOrganization } from "@/hooks/useOrganization";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { useFormatsForSelect } from "@/hooks/useFormatsForSelect";
import { useDefaultPriceBreaks } from "@/hooks/useDefaultPriceBreaks";

interface QuoteRequestDialogProps {
  suppliers: Supplier[];
  onSuccess?: () => void;
}

export function QuoteRequestDialog({ suppliers, onSuccess }: QuoteRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const { currentOrganization } = useOrganization();
  const { useCreateQuoteRequest } = useQuoteRequests();
  const createMutation = useCreateQuoteRequest();
  
  // Prefetch formats when dialog button is rendered
  const { refetch: refetchFormats } = useFormatsForSelect(currentOrganization);
  
  // Prefetch default price breaks when dialog button is rendered
  useDefaultPriceBreaks(currentOrganization);

  // Prefetch formats when dialog opens
  useEffect(() => {
    if (open && currentOrganization) {
      refetchFormats();
    }
  }, [open, currentOrganization, refetchFormats]);

  const handleSubmit = (formData: QuoteRequestFormValues) => {
    if (currentOrganization) {
      createMutation.mutate(
        {
          formData,
          organizationId: currentOrganization.id,
        },
        {
          onSuccess: () => {
            setOpen(false);
            if (onSuccess) onSuccess();
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Quote Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Quote Request</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-1 flex-grow">
          <QuoteRequestForm 
            suppliers={suppliers} 
            onSubmit={handleSubmit} 
            onCancel={() => setOpen(false)} 
            isSubmitting={createMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
