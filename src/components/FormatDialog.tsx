
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import FormatForm from "./FormatForm";
import { LinkedProductsGallery } from "./format/LinkedProductsGallery";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type FormatDialogProps = {
  open: boolean;
  formatId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const FormatDialog = ({ open, formatId, onOpenChange, onSuccess }: FormatDialogProps) => {
  const isEditMode = !!formatId;
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{isEditMode ? "Edit Format" : "Add New Format"}</DialogTitle>
          <div className="flex space-x-2">
            <Button variant="outline" type="button" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="format-form" 
              disabled={isLoading} 
              variant={isEditMode ? "success" : "default"}
            >
              {isLoading ? "Saving..." : isEditMode ? "Update Format" : "Create Format"}
            </Button>
          </div>
        </DialogHeader>
        <FormatForm 
          formatId={formatId || undefined} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel}
          formId="format-form"
          setIsLoading={setIsLoading}
          hideButtons={true}
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
