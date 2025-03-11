
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { SortQuoteRequestField, SortDirection } from "@/types/quoteRequest";
import { Button } from "@/components/ui/button";

interface QuoteRequestTableHeaderProps {
  sortField: SortQuoteRequestField;
  sortDirection: SortDirection;
  onSort: (field: SortQuoteRequestField) => void;
}

export const QuoteRequestTableHeader = ({ 
  sortField, 
  sortDirection, 
  onSort 
}: QuoteRequestTableHeaderProps) => {
  const renderSortIcon = (field: SortQuoteRequestField) => {
    if (field !== sortField) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-1 -ml-3 font-medium flex items-center"
            onClick={() => onSort('title')}
          >
            Title {renderSortIcon('title')}
          </Button>
        </TableHead>
        <TableHead>Formats</TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-1 -ml-3 font-medium flex items-center"
            onClick={() => onSort('status')}
          >
            Status {renderSortIcon('status')}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-1 -ml-3 font-medium flex items-center"
            onClick={() => onSort('due_date')}
          >
            Due Date {renderSortIcon('due_date')}
          </Button>
        </TableHead>
        <TableHead>Quotes</TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-1 -ml-3 font-medium flex items-center"
            onClick={() => onSort('created_at')}
          >
            Created {renderSortIcon('created_at')}
          </Button>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
