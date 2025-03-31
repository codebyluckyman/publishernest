
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ExistingQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  onContinueNew: () => void;
}

export function ExistingQuoteDialog({
  open,
  onOpenChange,
  quoteId,
  onContinueNew
}: ExistingQuoteDialogProps) {
  const navigate = useNavigate();

  const handleResume = () => {
    navigate(`/quotes/${quoteId}/edit`);
    onOpenChange(false);
  };

  const handleContinueNew = () => {
    onContinueNew();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Existing Quote Found</AlertDialogTitle>
          <AlertDialogDescription>
            A draft quote response already exists for this supplier and quote request.
            Would you like to resume editing the existing quote or create a new one?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleContinueNew}>Create New</AlertDialogCancel>
          <AlertDialogAction onClick={handleResume}>
            Resume Existing
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
