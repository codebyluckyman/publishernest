
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TextSectionForm } from "./TextSectionForm";

interface EditTextSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    title: string;
    description: string;
    content: string;
  }) => void;
  initialData: {
    title: string;
    description: string;
    content: string;
  };
}

export function EditTextSectionDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: EditTextSectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Text Section</DialogTitle>
        </DialogHeader>
        <TextSectionForm 
          onSave={(data) => {
            onSave(data);
            onOpenChange(false);
          }}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
