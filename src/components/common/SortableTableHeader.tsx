
import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SortDirection } from "@/types/sorting";

interface SortableTableHeaderProps<T> {
  field: T;
  label: string;
  currentSortField: T | null;
  sortDirection: SortDirection;
  onSort: (field: T) => void;
}

export function SortableTableHeader<T>({
  field,
  label,
  currentSortField,
  sortDirection,
  onSort,
}: SortableTableHeaderProps<T>) {
  const renderSortIndicator = () => {
    if (currentSortField !== field) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUp className="ml-1 h-4 w-4 inline" /> 
      : <ChevronDown className="ml-1 h-4 w-4 inline" />;
  };

  return (
    <TableHead>
      <Button 
        variant="ghost" 
        className="p-0 font-medium h-auto"
        onClick={() => onSort(field)}
      >
        {label} {renderSortIndicator()}
      </Button>
    </TableHead>
  );
}
