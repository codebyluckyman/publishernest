
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { SortQuoteRequestField, SortDirection } from "@/types/quoteRequest";
import { SortableTableHeader } from "./SortableTableHeader";
import { Checkbox } from "@/components/ui/checkbox";

interface QuoteRequestTableHeaderProps {
  sortField: SortQuoteRequestField;
  sortDirection: SortDirection;
  handleSort: (field: SortQuoteRequestField) => void;
  selectedRows: string[];
  allRowIds: string[];
  onSelectAll: (selected: boolean) => void;
}

export function QuoteRequestTableHeader({
  sortField,
  sortDirection,
  handleSort,
  selectedRows,
  allRowIds,
  onSelectAll,
}: QuoteRequestTableHeaderProps) {
  const allSelected = allRowIds.length > 0 && selectedRows.length === allRowIds.length;
  const indeterminate = selectedRows.length > 0 && selectedRows.length < allRowIds.length;

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox 
            checked={allSelected} 
            onCheckedChange={onSelectAll}
            className="mr-2"
            ref={(checkbox) => {
              // Set indeterminate state if some but not all rows are selected
              if (checkbox) {
                // Using DOM API directly since the React interface doesn't include indeterminate
                (checkbox as unknown as HTMLInputElement).indeterminate = indeterminate;
              }
            }}
          />
        </TableHead>
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
