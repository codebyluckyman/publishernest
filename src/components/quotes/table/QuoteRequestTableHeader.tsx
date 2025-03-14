
import { TableHeader, TableRow } from "@/components/ui/table";
import { SortQuoteRequestField, SortDirection } from "@/types/quoteRequest";
import { SortableTableHeader } from "./SortableTableHeader";

interface QuoteRequestTableHeaderProps {
  sortField: SortQuoteRequestField;
  sortDirection: SortDirection;
  handleSort: (field: SortQuoteRequestField) => void;
}

export function QuoteRequestTableHeader({
  sortField,
  sortDirection,
  handleSort,
}: QuoteRequestTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <SortableTableHeader
          field="title"
          label="Title"
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableTableHeader
          field="supplier_name"
          label="Supplier(s)"
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableTableHeader
          field="requested_at"
          label="Date Requested"
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableTableHeader
          field="due_date"
          label="Due Date"
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableTableHeader
          field="status"
          label="Status"
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <TableHead>Formats</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
