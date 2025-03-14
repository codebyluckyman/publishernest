
import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SortQuoteRequestField, SortDirection } from "@/types/quoteRequest";

interface SortableTableHeaderProps {
  field: SortQuoteRequestField;
  label: string;
  currentSortField: SortQuoteRequestField;
  sortDirection: SortDirection;
  onSort: (field: SortQuoteRequestField) => void;
}

export function SortableTableHeader({
  field,
  label,
  currentSortField,
  sortDirection,
  onSort,
}: SortableTableHeaderProps) {
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
        className="p-0 font-medium"
        onClick={() => onSort(field)}
      >
        {label} {renderSortIndicator()}
      </Button>
    </TableHead>
  );
}
