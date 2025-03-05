
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import FormatForm from "./FormatForm";
import { LinkedProductsGallery } from "./format/LinkedProductsGallery";

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

  const handleDelete = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Format" : "Add New Format"}</DialogTitle>
        </DialogHeader>
        <FormatForm 
          formatId={formatId || undefined} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
        
        {isEditMode && formatId && (
          <>
            <Separator className="my-4" />
            <LinkedProductsGallery formatId={formatId} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FormatDialog;
