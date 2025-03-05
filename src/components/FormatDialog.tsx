
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FormatForm from "./FormatForm";

type FormatDialogProps = {
  open: boolean;
  formatId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const FormatDialog = ({ open, formatId, onOpenChange, onSuccess }: FormatDialogProps) => {
  const isEditMode = !!formatId;
  
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Format" : "Add New Format"}</DialogTitle>
        </DialogHeader>
        <FormatForm 
          formatId={formatId || undefined} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default FormatDialog;
