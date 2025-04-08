
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
      label = "draft";
      break;
    case 'approved':
      variant = "secondary";
      label = "approved";
      break;
    case 'sent':
      variant = "default";
      label = "sent";
      break;
    case 'received':
      variant = "default";
      label = "received";
      break;
    case 'cancelled':
      variant = "destructive";
      label = "cancelled";
      break;
  }

  return (
    <Badge variant={variant} className="capitalize">
      {label}
    </Badge>
  );
}
