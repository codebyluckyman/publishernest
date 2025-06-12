
import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
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
    if (currentSortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 inline text-gray-400" />;
    }
    
    return sortDirection === "asc" 
      ? <ChevronUp className="ml-1 h-4 w-4 inline text-blue-600" /> 
      : <ChevronDown className="ml-1 h-4 w-4 inline text-blue-600" />;
  };

  return (
    <TableHead>
      <Button 
        variant="ghost" 
        className="p-0 font-medium h-auto hover:bg-muted/50 transition-colors"
        onClick={() => onSort(field)}
      >
        {label} {renderSortIndicator()}
      </Button>
    </TableHead>
  );
}
