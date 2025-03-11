
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SortQuoteField, SortDirection } from "@/types/quote";

interface QuoteTableHeaderProps {
  sortField: SortQuoteField;
  sortDirection: SortDirection;
  onSort: (field: SortQuoteField) => void;
}

export const QuoteTableHeader = ({ 
  sortField, 
  sortDirection, 
  onSort 
}: QuoteTableHeaderProps) => {
  const SortIcon = ({ field }: { field: SortQuoteField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => onSort('supplier_name')}
        >
          <div className="flex items-center">
            Supplier
            <SortIcon field="supplier_name" />
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => onSort('quote_date')}
        >
          <div className="flex items-center">
            Quote Date
            <SortIcon field="quote_date" />
          </div>
        </TableHead>
        <TableHead>Quote #</TableHead>
        <TableHead>Quote Request</TableHead>
        <TableHead
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => onSort('total_amount')}
        >
          <div className="flex items-center">
            Amount
            <SortIcon field="total_amount" />
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => onSort('status')}
        >
          <div className="flex items-center">
            Status
            <SortIcon field="status" />
          </div>
        </TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
