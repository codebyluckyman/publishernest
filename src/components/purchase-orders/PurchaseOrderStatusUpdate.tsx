
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { PurchaseOrder, PurchaseOrderStatusCode, PURCHASE_ORDER_STATUS_MAP } from '@/types/purchaseOrder';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';

interface PurchaseOrderStatusUpdateProps {
  purchaseOrder: PurchaseOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Get available next status codes based on current status
function getNextAvailableStatusCodes(currentCode: PurchaseOrderStatusCode): PurchaseOrderStatusCode[] {
  const statusCodes = Object.keys(PURCHASE_ORDER_STATUS_MAP) as PurchaseOrderStatusCode[];
  const currentIndex = statusCodes.indexOf(currentCode);
  
  // If cancelled or completed, don't allow further changes
  if (currentCode === '90') {
    return [];
  }
  
  // Return the current status and the next status in the workflow
  // Plus "Completed" as a shortcut option
  const result: PurchaseOrderStatusCode[] = [];
  
  // Always include the current status
  result.push(currentCode);
  
  // Include next status if available
  if (currentIndex < statusCodes.length - 1) {
    result.push(statusCodes[currentIndex + 1]);
  }
  
  // Include Completed as a shortcut option except if already there
  if (!result.includes('90')) {
    result.push('90');
  }
  
  return result;
}

const formSchema = z.object({
  statusCode: z.string(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PurchaseOrderStatusUpdate({ 
  purchaseOrder, 
  open, 
  onOpenChange 
}: PurchaseOrderStatusUpdateProps) {
  const { updatePurchaseOrderStatusCode } = usePurchaseOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      statusCode: purchaseOrder.status_code,
      notes: '',
    },
  });
  
  const nextAvailableStatusCodes = getNextAvailableStatusCodes(purchaseOrder.status_code);
  
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      await updatePurchaseOrderStatusCode({
        id: purchaseOrder.id,
        statusCode: values.statusCode as PurchaseOrderStatusCode,
        notes: values.notes,
      });
      
      toast.success('Purchase order status updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update purchase order status');
      console.error('Error updating purchase order status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Purchase Order Status</DialogTitle>
          <DialogDescription>
            Change the status of purchase order {purchaseOrder.po_number}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="statusCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {nextAvailableStatusCodes.map(code => (
                        <SelectItem key={code} value={code}>
                          {PURCHASE_ORDER_STATUS_MAP[code].label} ({code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add notes about this status change" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                Update Status
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
