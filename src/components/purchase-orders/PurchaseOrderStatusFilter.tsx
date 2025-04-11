
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PURCHASE_ORDER_STATUS_MAP, PurchaseOrderStatusCode } from '@/types/purchaseOrder';

interface PurchaseOrderStatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function PurchaseOrderStatusFilter({ value, onValueChange }: PurchaseOrderStatusFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">All Statuses</SelectItem>
          {Object.entries(PURCHASE_ORDER_STATUS_MAP).map(([code, data]) => (
            <SelectItem key={code} value={code}>
              {data.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
