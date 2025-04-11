
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PurchaseOrder } from "@/types/purchaseOrder";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { Loader2 } from "lucide-react";

interface PurchaseOrderApprovalDialogProps {
  purchaseOrder: PurchaseOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseOrderApprovalDialog({
  purchaseOrder,
  open,
  onOpenChange,
}: PurchaseOrderApprovalDialogProps) {
  const { updatePurchaseOrderStatus } = usePurchaseOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isPendingApproval = purchaseOrder.status_code === '00' && purchaseOrder.status !== 'cancelled';
  const isDraft = purchaseOrder.status_code === '00';
  
  const handleAction = async () => {
    try {
      setIsSubmitting(true);
      
      // If currently draft, set to pending approval
      if (isDraft) {
        await updatePurchaseOrderStatus({
          id: purchaseOrder.id,
          status: 'draft' // Using a valid status value
        });
      }
      // If pending approval, approve it
      else if (isPendingApproval) {
        await updatePurchaseOrderStatus({
          id: purchaseOrder.id,
          status: 'approved'
        });
      }
      
      onOpenChange(false);
    } catch (err) {
      console.error('Error updating purchase order status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const title = isPendingApproval ? "Approve Purchase Order" : "Request Approval";
  const description = isPendingApproval
    ? "Are you sure you want to approve this purchase order? This action will mark the purchase order as approved."
    : "Are you sure you want to submit this purchase order for approval? This will change its status to 'Pending Approval'.";
  const actionButtonText = isPendingApproval ? "Approve" : "Submit for Approval";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleAction} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {actionButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
