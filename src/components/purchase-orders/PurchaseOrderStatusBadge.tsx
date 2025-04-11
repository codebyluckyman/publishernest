
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrder, PurchaseOrderStatusCode, PURCHASE_ORDER_STATUS_MAP } from '@/types/purchaseOrder';

interface PurchaseOrderStatusBadgeProps {
  status: PurchaseOrderStatus | PurchaseOrderStatusCode;
  className?: string;
}

export function PurchaseOrderStatusBadge({ status, className = '' }: PurchaseOrderStatusBadgeProps) {
  // Determine if the status is a code or a status string
  const isStatusCode = status.length === 2 && /^\d+$/.test(status);
  
  // Get the appropriate status data
  const statusData = isStatusCode
    ? PURCHASE_ORDER_STATUS_MAP[status as PurchaseOrderStatusCode] 
    : Object.values(PURCHASE_ORDER_STATUS_MAP).find(s => s.status === status);
  
  // Handle canceled status which is special case
  if (status === 'cancelled') {
    return <Badge className={`bg-red-100 text-red-800 ${className}`}>Cancelled</Badge>;
  }
  
  // If status isn't found, return default badge
  if (!statusData) {
    return <Badge className={`bg-gray-100 text-gray-800 ${className}`}>{status}</Badge>;
  }
  
  return (
    <Badge className={`${statusData.color} ${className}`}>
      {statusData.label}
    </Badge>
  );
}
