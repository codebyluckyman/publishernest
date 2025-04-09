
import React, { useState } from 'react';
import { useCustomerRequirements } from '@/hooks/useCustomerRequirements';
import { RequirementsList } from './RequirementsList';
import { RequirementDialog } from './RequirementDialog';
import { DeleteRequirementDialog } from './DeleteRequirementDialog';
import { CustomerRequirement } from '@/types/customerRequirement';

interface CustomerRequirementsTabProps {
  customerId: string;
}

export function CustomerRequirementsTab({ customerId }: CustomerRequirementsTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<CustomerRequirement | undefined>(undefined);

  const {
    requirements,
    isLoadingRequirements,
    isErrorRequirements,
    errorRequirements,
    createRequirement,
    isCreatingRequirement,
    updateRequirement,
    isUpdatingRequirement,
    deleteRequirement,
    isDeletingRequirement,
  } = useCustomerRequirements(customerId);

  const handleAddRequirement = () => {
    setSelectedRequirement(undefined);
    setIsCreateDialogOpen(true);
  };

  const handleEditRequirement = (requirement: CustomerRequirement) => {
    setSelectedRequirement(requirement);
    setIsEditDialogOpen(true);
  };

  const handleDeleteRequirement = (requirementId: string) => {
    const requirement = requirements.find((r) => r.id === requirementId);
    setSelectedRequirement(requirement);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = (data: Omit<CustomerRequirement, 'id' | 'created_at' | 'updated_at'>) => {
    createRequirement(
      {
        customer_id: customerId,
        ...data,
      },
      {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
        },
      }
    );
  };

  const handleEditSubmit = (data: Partial<CustomerRequirement>) => {
    if (!selectedRequirement) return;

    updateRequirement(
      {
        id: selectedRequirement.id,
        ...data,
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedRequirement(undefined);
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!selectedRequirement) return;

    deleteRequirement(selectedRequirement.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedRequirement(undefined);
      },
    });
  };

  return (
    <div>
      <RequirementsList
        requirements={requirements}
        isLoading={isLoadingRequirements}
        isError={isErrorRequirements}
        errorMessage={errorRequirements instanceof Error ? errorRequirements.message : undefined}
        onAddRequirement={handleAddRequirement}
        onEditRequirement={handleEditRequirement}
        onDeleteRequirement={handleDeleteRequirement}
      />

      <RequirementDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        customerId={customerId}
        onSubmit={handleCreateSubmit}
        isSubmitting={isCreatingRequirement}
        title="Add Requirement"
      />

      <RequirementDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        customerId={customerId}
        requirement={selectedRequirement}
        onSubmit={handleEditSubmit}
        isSubmitting={isUpdatingRequirement}
        title="Edit Requirement"
      />

      <DeleteRequirementDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeletingRequirement}
      />
    </div>
  );
}
