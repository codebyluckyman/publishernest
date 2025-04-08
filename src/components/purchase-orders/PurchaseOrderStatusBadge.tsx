
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { PurchaseOrderStatus } from '@/types/purchaseOrder';

interface PurchaseOrderStatusBadgeProps {
  status: PurchaseOrderStatus;
}

export function PurchaseOrderStatusBadge({ status }: PurchaseOrderStatusBadgeProps) {
  let variant: "default" | "secondary" | "outline" | "destructive" = "default";
  let label = status;
  
  switch (status) {
    case 'draft':
      variant = "outline";
      label = "Draft";
      break;
    case 'approved':
      variant = "secondary";
      label = "Approved";
      break;
    case 'sent':
      variant = "default";
      label = "Sent";
      break;
    case 'received':
      variant = "default";
      label = "Received";
      break;
    case 'cancelled':
      variant = "destructive";
      label = "Cancelled";
      break;
  }

  return (
    <Badge variant={variant} className="capitalize">
      {label}
    </Badge>
  );
}
