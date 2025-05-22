
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export interface SupplierQuotesEmptyStateProps {
  printRunId?: string;
  quoteRequestId?: string;
  onCreateNew?: () => void;
}

export function SupplierQuotesEmptyState({ 
  printRunId, 
  quoteRequestId,
  onCreateNew 
}: SupplierQuotesEmptyStateProps) {
  // Use either printRunId or quoteRequestId (they refer to the same thing)
  const hasQuoteRequest = printRunId || quoteRequestId;
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
        <Plus className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium">No Supplier Quotes</h3>
      <p className="text-sm text-gray-500 max-w-md">
        {hasQuoteRequest 
          ? "No supplier quotes have been created for this print run yet."
          : "No supplier quotes match your current filters."
        }
      </p>
      {onCreateNew && (
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Supplier Quote
        </Button>
      )}
    </div>
  );
}
