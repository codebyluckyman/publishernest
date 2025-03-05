
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import FormatReadOnlyForm from "./FormatReadOnlyForm";
import { LinkedProductsGallery } from "./format/LinkedProductsGallery";

type FormatViewDialogProps = {
  open: boolean;
  formatId: string | null;
  onOpenChange: (open: boolean) => void;
};

const FormatViewDialog = ({ open, formatId, onOpenChange }: FormatViewDialogProps) => {
  if (!formatId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Format Details</DialogTitle>
        </DialogHeader>
        
        <FormatReadOnlyForm formatId={formatId} />
        
        <Separator className="my-4" />
        <LinkedProductsGallery formatId={formatId} />
      </DialogContent>
    </Dialog>
  );
};

export default FormatViewDialog;
