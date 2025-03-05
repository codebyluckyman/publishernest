
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import FormatForm from "./FormatForm";
import { LinkedProductsGallery } from "./format/LinkedProductsGallery";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
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

  const handleDelete = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{isEditMode ? "Edit Format" : "Add New Format"}</DialogTitle>
          <div className="flex space-x-2">
            {isEditMode && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button" disabled={isLoading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this format and cannot be undone. This may also affect products that use this format.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
          onDelete={handleDelete}
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
