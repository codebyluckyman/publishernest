
type EmptyStateProps = {
  isLoading: boolean;
};

export const EmptyState = ({ isLoading }: EmptyStateProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading quote requests...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-medium">No quote requests found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new quote request to get started
        </p>
      </div>
    </div>
  );
};
