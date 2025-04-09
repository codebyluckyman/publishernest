
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomerRequirement } from '@/types/customerRequirement';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AddRequirementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerRequirements: CustomerRequirement[];
  existingRequirementIds: string[];
  onAddRequirements: (requirementIds: string[]) => void;
  isLoading?: boolean;
}

export function AddRequirementsDialog({
  open,
  onOpenChange,
  customerRequirements,
  existingRequirementIds,
  onAddRequirements,
  isLoading = false,
}: AddRequirementsDialogProps) {
  const [selectedRequirements, setSelectedRequirements] = useState<Record<string, boolean>>({});
  
  // Filter out requirements that are already added to the sales order
  const availableRequirements = customerRequirements.filter(
    (req) => !existingRequirementIds.includes(req.id)
  );

  useEffect(() => {
    // Initialize with mandatory requirements selected
    if (open) {
      const initialSelected: Record<string, boolean> = {};
      availableRequirements.forEach((req) => {
        initialSelected[req.id] = req.is_mandatory;
      });
      setSelectedRequirements(initialSelected);
    }
  }, [open, availableRequirements]);

  const handleToggleRequirement = (requirementId: string) => {
    setSelectedRequirements((prev) => ({
      ...prev,
      [requirementId]: !prev[requirementId],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = availableRequirements.every((req) => selectedRequirements[req.id]);
    const newSelected: Record<string, boolean> = {};
    availableRequirements.forEach((req) => {
      newSelected[req.id] = !allSelected;
    });
    setSelectedRequirements(newSelected);
  };

  const handleSubmit = () => {
    const requirementIds = Object.entries(selectedRequirements)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
    
    onAddRequirements(requirementIds);
  };

  const getRequirementTypeBadge = (type: string) => {
    switch (type) {
      case 'packaging':
        return <Badge variant="outline" className="bg-blue-50">Packaging</Badge>;
      case 'shipping':
        return <Badge variant="outline" className="bg-green-50">Shipping</Badge>;
      case 'quality':
        return <Badge variant="outline" className="bg-purple-50">Quality Control</Badge>;
      case 'documentation':
        return <Badge variant="outline" className="bg-yellow-50">Documentation</Badge>;
      case 'approval':
        return <Badge variant="outline" className="bg-orange-50">Approval</Badge>;
      case 'payment':
        return <Badge variant="outline" className="bg-red-50">Payment</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Customer Requirements</DialogTitle>
          <DialogDescription>
            Select requirements to add to this sales order. Mandatory requirements are selected by default.
          </DialogDescription>
        </DialogHeader>
        
        {availableRequirements.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">
              All customer requirements have already been added to this sales order.
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        availableRequirements.length > 0 &&
                        availableRequirements.every((req) => selectedRequirements[req.id])
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Mandatory</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableRequirements.map((requirement) => (
                  <TableRow key={requirement.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRequirements[requirement.id] || false}
                        onCheckedChange={() => handleToggleRequirement(requirement.id)}
                        aria-label={`Select ${requirement.description}`}
                      />
                    </TableCell>
                    <TableCell>{getRequirementTypeBadge(requirement.requirement_type)}</TableCell>
                    <TableCell className="font-medium max-w-md truncate">
                      {requirement.description}
                    </TableCell>
                    <TableCell>
                      {requirement.is_mandatory ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              availableRequirements.length === 0 ||
              Object.values(selectedRequirements).every((v) => !v)
            }
          >
            {isLoading ? 'Adding...' : 'Add Selected Requirements'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
