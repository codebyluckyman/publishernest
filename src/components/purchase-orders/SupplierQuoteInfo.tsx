
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SupplierQuoteInfoProps {
  supplierName: string;
  quoteReference: string;
  validFrom?: string | null;
  validTo?: string | null;
  onViewDetails: () => void;
}

export function SupplierQuoteInfo({
  supplierName,
  quoteReference,
  validFrom,
  validTo,
  onViewDetails
}: SupplierQuoteInfoProps) {
  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Supplier</p>
            <p className="font-medium">{supplierName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Quote Reference</p>
            <p className="font-medium">{quoteReference}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Validity Period</p>
            <p className="font-medium">
              {validFrom ? formatDate(validFrom) : 'N/A'} 
              {validTo ? ` to ${formatDate(validTo)}` : ''}
            </p>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onViewDetails}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Quote Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
