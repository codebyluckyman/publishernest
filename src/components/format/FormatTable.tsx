
import { Table, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { FormatEmptyState } from "./FormatEmptyState";
import { FilterOptions } from "./FormatFilters";
import { useFormatTable } from "@/hooks/format/useFormatTable";
import { FormatTableBody } from "./table/FormatTableBody";
import { FormatTableSkeleton } from "./table/FormatTableSkeleton";
import { SortableTableHead } from "./table/SortableTableHead";
import { usePagination, PageSize } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface FormatTableProps {
  searchQuery: string;
  filters: FilterOptions;
  organizationId: string | undefined;
  onViewFormat: (formatId: string) => void;
  onEditFormat: (formatId: string) => void;
  onAddFormat: () => void;
  setFilterOptions: React.Dispatch<React.SetStateAction<{
    cover_stock_print: string[];
    internal_stock_print: string[];
  }>>;
  refreshTrigger?: number;
  triggerRefresh?: () => void;
}

export function FormatTable({
  searchQuery,
  filters,
  organizationId,
  onViewFormat,
  onEditFormat,
  onAddFormat,
  setFilterOptions,
  refreshTrigger = 0,
  triggerRefresh
}: FormatTableProps) {
  const {
    formats,
    isLoading,
    formatDate,
    sortField,
    sortDirection,
    handleSort
  } = useFormatTable({
    searchQuery,
    filters,
    organizationId,
    refreshTrigger,
    onSetFilterOptions: setFilterOptions
  });

  // Add pagination
  const {
    currentData: paginatedFormats,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
  } = usePagination({
    data: formats || [],
    initialPageSize: 10,
  });

  const handleFormatCopied = (newFormatId?: string) => {
    if (triggerRefresh) {
      triggerRefresh();
    }
    
    if (newFormatId) {
      onEditFormat(newFormatId);
    }
  };

  if (isLoading) {
    return <FormatTableSkeleton />;
  }

  if (!formats || formats.length === 0) {
    return <FormatEmptyState hasOrganization={!!organizationId} onAddFormat={onAddFormat} />;
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                label="Format Name"
                field="format_name"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <TableHead>TPS Dimensions</TableHead>
              <TableHead>PLC Dimensions</TableHead>
              <SortableTableHead
                label="Extent"
                field="extent_pages"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <TableHead>Cover Stock/Print</TableHead>
              <TableHead>Internal Stock/Print</TableHead>
              <SortableTableHead
                label="Created"
                field="created_at"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <FormatTableBody
            formats={paginatedFormats}
            onViewFormat={onViewFormat}
            onEditFormat={onEditFormat}
            formatDate={formatDate}
            onFormatCopied={handleFormatCopied}
          />
        </Table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={goToPage}
        onPreviousPage={previousPage}
        onNextPage={nextPage}
        onPageSizeChange={changePageSize}
      />
    </>
  );
}
