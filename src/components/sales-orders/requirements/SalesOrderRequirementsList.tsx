
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SalesOrderRequirement } from '@/types/customerRequirement';
import { PlusCircle, AlertCircle, Check, X, Clock } from 'lucide-react';
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

interface SalesOrderRequirementsListProps {
  requirements: SalesOrderRequirement[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onAddRequirements: () => void;
  onUpdateStatus: (requirement: SalesOrderRequirement, status: 'pending' | 'completed' | 'waived' | 'failed') => void;
  readOnly?: boolean;
}

export function SalesOrderRequirementsList({
  requirements,
  isLoading,
  isError,
  errorMessage,
  onAddRequirements,
  onUpdateStatus,
  readOnly = false,
}: SalesOrderRequirementsListProps) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'waived':
        return <Badge variant="outline" className="border-amber-500 text-amber-500"><Clock className="h-3 w-3 mr-1" /> Waived</Badge>;
      case 'failed':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{errorMessage || 'Failed to load sales order requirements'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Customer Requirements</CardTitle>
          <CardDescription>Track and manage customer-specific requirements for this order</CardDescription>
        </div>
        {!readOnly && (
          <Button onClick={onAddRequirements}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Requirements
          </Button>
        )}
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
              No customer requirements have been added to this sales order.
            </p>
            {!readOnly && (
              <Button onClick={onAddRequirements}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Requirements
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Mandatory</TableHead>
                <TableHead>Status</TableHead>
                {!readOnly && <TableHead className="w-48">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {requirements.map((requirement) => (
                <TableRow key={requirement.id}>
                  <TableCell>
                    {requirement.requirement && getRequirementTypeBadge(requirement.requirement.requirement_type)}
                  </TableCell>
                  <TableCell className="font-medium max-w-md truncate">
                    {requirement.requirement?.description}
                  </TableCell>
                  <TableCell>
                    {requirement.requirement?.is_mandatory ? (
                      <Badge variant="default">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(requirement.status)}</TableCell>
                  {!readOnly && (
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateStatus(requirement, 'completed')}
                          disabled={requirement.status === 'completed'}
                          className="text-green-600"
                        >
                          <Check className="h-4 w-4 mr-1" /> Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateStatus(requirement, 'waived')}
                          disabled={requirement.status === 'waived'}
                        >
                          Waive
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateStatus(requirement, 'failed')}
                          disabled={requirement.status === 'failed'}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4 mr-1" /> Fail
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
