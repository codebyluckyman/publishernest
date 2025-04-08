
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RequirementForm } from './RequirementForm';
import { CustomerRequirement } from '@/types/customerRequirement';

interface RequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  requirement?: CustomerRequirement;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  title?: string;
}

export function RequirementDialog({
  open,
  onOpenChange,
  customerId,
  requirement,
  onSubmit,
  isSubmitting,
  title = 'Add Requirement',
}: RequirementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {requirement
              ? 'Update this customer requirement with the form below.'
              : 'Add a new requirement for this customer.'}
          </DialogDescription>
        </DialogHeader>
        <RequirementForm
          customerId={customerId}
          defaultValues={requirement}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
