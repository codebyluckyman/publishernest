import { useState, useEffect, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Eye } from "lucide-react";
import { SupplierQuote, SupplierQuoteStatus } from "@/types/supplierQuote";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SupplierQuoteDetails } from "./SupplierQuoteDetails";

interface SupplierQuotesTableProps {
  statusFilter?: SupplierQuoteStatus[];
  searchQuery?: string;
  quoteRequestId?: string | null;
}

export function SupplierQuotesTable({ 
  statusFilter, 
  searchQuery,
  quoteRequestId
}: SupplierQuotesTableProps) {
  const [sorting, setSorting] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const { useSupplierQuotesByQuoteRequestId, useSupplierQuotesByStatus } = useSupplierQuotes();
  
  const { data: quotesByStatus, isLoading: isLoadingByStatus } = useSupplierQuotesByStatus(statusFilter);
  const { data: quotesByQuoteRequest, isLoading: isLoadingByQuoteRequest } = useSupplierQuotesByQuoteRequestId(quoteRequestId);
  
  const isLoading = isLoadingByStatus || isLoadingByQuoteRequest;
  
  const quotes = useMemo(() => {
    if (quoteRequestId && quotesByQuoteRequest) {
      return quotesByQuoteRequest;
    }
    return quotesByStatus || [];
  }, [quotesByStatus, quotesByQuoteRequest, quoteRequestId]);

  useEffect(() => {
    if (!showDetails) {
      setSelectedQuote(null);
    }
  }, [showDetails]);

  const filteredQuotes = useMemo(() => {
    if (!searchQuery) return quotes;

    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    return quotes?.filter(quote => {
      const supplierName = quote.supplier?.supplier_name?.toLowerCase();
      const reference = quote.reference?.toLowerCase();
      const referenceId = quote.reference_id?.toLowerCase();

      return (
        supplierName?.includes(lowerCaseSearchQuery) ||
        reference?.includes(lowerCaseSearchQuery) ||
        referenceId?.includes(lowerCaseSearchQuery)
      );
    }) ?? [];
  }, [searchQuery, quotes]);

  const columns: ColumnDef<SupplierQuote>[] = [
    {
      accessorKey: "supplier.supplier_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Supplier
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUp className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "total_cost",
      header: "Total Cost",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUp className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => formatDate(row.getValue("created_at")),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const supplierQuote = row.original;
        return (
          <Button variant="outline" size="sm" onClick={() => handleOpenDetails(supplierQuote)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        );
      },
    },
  ];

  const handleOpenDetails = (supplierQuote: SupplierQuote) => {
    setSelectedQuote(supplierQuote);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const table = useReactTable({
    data: filteredQuotes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredQuotes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showDetails && selectedQuote && (
        <Dialog open={showDetails} onOpenChange={handleCloseDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <SupplierQuoteDetails 
              quote={selectedQuote} 
              onClose={handleCloseDetails}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
