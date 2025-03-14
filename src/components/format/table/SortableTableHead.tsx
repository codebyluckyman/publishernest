
import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

export type SortField = 'format_name' | 'created_at' | 'extent_pages';
export type SortDirection = 'asc' | 'desc';

interface SortableTableHeadProps {
  label: string;
  field: SortField;
  currentSortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

export function SortableTableHead({
  label,
  field,
  currentSortField,
  sortDirection,
  onSort,
  className
}: SortableTableHeadProps) {
  const renderSortIcon = () => {
    if (field !== currentSortField) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />;
  };

  return (
    <TableHead className={className}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 px-1 -ml-3 font-medium flex items-center"
        onClick={() => onSort(field)}
      >
        {label} {renderSortIcon()}
      </Button>
    </TableHead>
  );
}
