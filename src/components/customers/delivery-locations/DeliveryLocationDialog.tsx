
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeliveryLocationForm } from './DeliveryLocationForm';
import { CustomerDeliveryLocationFormValues } from '@/types/customerDeliveryLocation';

interface DeliveryLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  defaultValues?: Partial<CustomerDeliveryLocationFormValues>;
  onSubmit: (data: CustomerDeliveryLocationFormValues) => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export function DeliveryLocationDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  isSubmitting,
  isEditMode = false,
}: DeliveryLocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DeliveryLocationForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
        />
      </DialogContent>
    </Dialog>
  );
}
