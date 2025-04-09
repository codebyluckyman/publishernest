
import React, { useState } from 'react';
import { useSalesOrderRequirements } from '@/hooks/useSalesOrderRequirements';
import { useCustomerRequirements } from '@/hooks/useCustomerRequirements';
import { SalesOrderRequirementsList } from './SalesOrderRequirementsList';
import { AddRequirementsDialog } from './AddRequirementsDialog';
import { SalesOrderRequirement } from '@/types/customerRequirement';

interface SalesOrderRequirementsSectionProps {
  salesOrderId: string;
  customerId: string;
  readOnly?: boolean;
}

export function SalesOrderRequirementsSection({
  salesOrderId,
  customerId,
  readOnly = false,
}: SalesOrderRequirementsSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const {
    requirements,
    isLoadingRequirements,
    isErrorRequirements,
    errorRequirements,
    createRequirement,
    isCreatingRequirement,
    updateRequirement,
    isUpdatingRequirement,
  } = useSalesOrderRequirements(salesOrderId);

  const {
    requirements: customerRequirements,
    isLoadingRequirements: isLoadingCustomerRequirements,
  } = useCustomerRequirements(customerId);

  const handleAddRequirements = () => {
    setIsAddDialogOpen(true);
  };

  const handleUpdateStatus = (requirement: SalesOrderRequirement, status: 'pending' | 'completed' | 'waived' | 'failed') => {
    updateRequirement({
      id: requirement.id,
      status,
    });
  };

  const handleAddSelectedRequirements = (requirementIds: string[]) => {
    // Create all requirements at once
    Promise.all(
      requirementIds.map((requirementId) =>
        createRequirement({
          sales_order_id: salesOrderId,
          requirement_id: requirementId,
          status: 'pending',
        })
      )
    ).then(() => {
      setIsAddDialogOpen(false);
    });
  };

  // Get IDs of requirements that are already added to the sales order
  const existingRequirementIds = requirements.map((req) => req.requirement_id);

  return (
    <>
      <SalesOrderRequirementsList
        requirements={requirements}
        isLoading={isLoadingRequirements}
        isError={isErrorRequirements}
        errorMessage={errorRequirements instanceof Error ? errorRequirements.message : undefined}
        onAddRequirements={handleAddRequirements}
        onUpdateStatus={handleUpdateStatus}
        readOnly={readOnly}
      />

      <AddRequirementsDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        customerRequirements={customerRequirements}
        existingRequirementIds={existingRequirementIds}
        onAddRequirements={handleAddSelectedRequirements}
        isLoading={isCreatingRequirement}
      />
    </>
  );
}
