
interface EmptyProductsListProps {
  title?: string;
}

export function EmptyProductsList({ title = "Linked Products" }: EmptyProductsListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
        No products are currently using this format
      </div>
    </div>
  );
}
