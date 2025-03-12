
import { useState } from "react";
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

interface QuoteRequestDialogProps {
  suppliers: Supplier[];
  onSuccess?: () => void;
}

export function QuoteRequestDialog({ suppliers, onSuccess }: QuoteRequestDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Quote Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Quote Request</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-1 flex-grow">
          <QuoteRequestForm 
            suppliers={suppliers} 
            onSuccess={handleSuccess} 
            onCancel={() => setOpen(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
