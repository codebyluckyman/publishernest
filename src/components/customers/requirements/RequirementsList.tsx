
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerRequirement } from '@/types/customerRequirement';
import { Pencil, Trash, Plus, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface RequirementsListProps {
  requirements: CustomerRequirement[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onAddRequirement: () => void;
  onEditRequirement: (requirement: CustomerRequirement) => void;
  onDeleteRequirement: (requirementId: string) => void;
}

export function RequirementsList({
  requirements,
  isLoading,
  isError,
  errorMessage,
  onAddRequirement,
  onEditRequirement,
  onDeleteRequirement,
}: RequirementsListProps) {
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

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{errorMessage || 'Failed to load customer requirements'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Customer Requirements</CardTitle>
          <CardDescription>Manage specific requirements for this customer</CardDescription>
        </div>
        <Button onClick={onAddRequirement}>
          <Plus className="mr-2 h-4 w-4" /> Add Requirement
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : requirements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium">No Requirements</h3>
            <p className="text-sm text-gray-500 mt-2 mb-4">
              This customer has no specific requirements yet.
            </p>
            <Button onClick={onAddRequirement}>
              <Plus className="mr-2 h-4 w-4" /> Add First Requirement
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Mandatory</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requirements.map((requirement) => (
                <TableRow key={requirement.id}>
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
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditRequirement(requirement)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteRequirement(requirement.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
