
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SupplierQuotesEmptyStateProps {
  printRunId?: string;
  quoteRequestId?: string; 
  onCreateNew?: () => void;
}

export const SupplierQuotesEmptyState: React.FC<SupplierQuotesEmptyStateProps> = ({ 
  printRunId,
  quoteRequestId,
  onCreateNew 
}) => {
  // Use either printRunId or quoteRequestId (they represent the same thing)
  const requestId = printRunId || quoteRequestId;
  
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-gray-50 border border-dashed rounded-lg text-center">
      <h3 className="text-lg font-medium mb-2">No Supplier Quotes Found</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {requestId 
          ? "There are no supplier quotes yet for this request. Create a new one to get started."
          : "No supplier quotes found. Create a new quote request first, then add quotes from suppliers."}
      </p>
      
      {onCreateNew && requestId && (
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Quote
        </Button>
      )}
    </div>
  );
};
