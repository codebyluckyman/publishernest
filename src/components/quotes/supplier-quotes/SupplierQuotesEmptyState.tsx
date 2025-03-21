
import { CircleDollarSign } from "lucide-react";

interface SupplierQuotesEmptyStateProps {
  statusFilter?: string[] | undefined;
}

export function SupplierQuotesEmptyState({ statusFilter }: SupplierQuotesEmptyStateProps) {
  let message = "No quotes found";
  let description = "Create a quote request to get started";
  
  if (statusFilter) {
    if (statusFilter.includes('draft') || statusFilter.includes('submitted')) {
      message = "No active quotes";
      description = "All supplier quotes that are in draft or submitted status will appear here";
    } else if (statusFilter.includes('accepted') || statusFilter.includes('declined')) {
      message = "No completed quotes";
      description = "Quotes will appear here once they are accepted or declined";
    }
  }
  
  return (
    <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CircleDollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-medium">{message}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
