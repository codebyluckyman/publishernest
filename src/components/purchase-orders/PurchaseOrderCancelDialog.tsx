
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PurchaseOrder } from "@/types/purchaseOrder";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { Loader2 } from "lucide-react";

interface PurchaseOrderCancelDialogProps {
  purchaseOrder: PurchaseOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseOrderCancelDialog({
  purchaseOrder,
  open,
  onOpenChange,
}: PurchaseOrderCancelDialogProps) {
  const { updatePurchaseOrderStatus } = usePurchaseOrders();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCancel = async () => {
    try {
      setIsSubmitting(true);
      
      await updatePurchaseOrderStatus({
        id: purchaseOrder.id,
        status: 'cancelled',
        reason: reason.trim() || 'No reason provided',
      });
      
      onOpenChange(false);
    } catch (err) {
      console.error('Error cancelling purchase order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Purchase Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this purchase order? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="reason">Reason for cancellation</Label>
          <Textarea
            id="reason"
            placeholder="Please provide a reason for cancellation"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2"
            disabled={isSubmitting}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirm Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
