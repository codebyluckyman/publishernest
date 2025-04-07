
import { useState, useEffect, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  getPaginationRowModel,
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
import { ArrowDown, ArrowUp } from "lucide-react";
import { SupplierQuote, SupplierQuoteStatus } from "@/types/supplierQuote";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SupplierQuoteDetails } from "./SupplierQuoteDetails";
import { useOrganization } from "@/context/OrganizationContext";
import { SupplierQuoteDialog } from "./SupplierQuoteDialog";
import { SupplierQuoteActions } from "./SupplierQuoteActions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QuoteRequest } from "@/types/quoteRequest";

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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteForDeletion, setQuoteForDeletion] = useState<SupplierQuote | null>(null);
  const { currentOrganization } = useOrganization();
  const { useSupplierQuotesList, useSubmitSupplierQuote, useDeleteSupplierQuote } = useSupplierQuotes();
  const submitMutation = useSubmitSupplierQuote();
  const deleteMutation = useDeleteSupplierQuote();
  
  // Use the existing hook with appropriate filters
  const { data: quotes = [], isLoading } = useSupplierQuotesList(
    currentOrganization,
    statusFilter ? statusFilter.join(',') : undefined,
    undefined,
    quoteRequestId || undefined,
    searchQuery
  );
  
  const [pageSize, setPageSize] = useState(10);
  
  useEffect(() => {
    if (!showDetails) {
      setSelectedQuote(null);
    }
  }, [showDetails]);

  useEffect(() => {
    if (!showEditDialog) {
      setSelectedQuote(null);
    }
  }, [showEditDialog]);

  // Quote actions handlers
  const handleView = (quote: SupplierQuote) => {
    setSelectedQuote(quote);
    setShowDetails(true);
  };

  const handleEdit = (quote: SupplierQuote) => {
    setSelectedQuote(quote);
    setShowEditDialog(true);
  };

  const handleSubmit = (quote: SupplierQuote) => {
    submitMutation.mutate({
      id: quote.id,
      totalCost: quote.total_cost || 0
    }, {
      onSuccess: () => {
        toast.success('Quote submitted successfully');
      }
    });
  };

  const confirmDelete = () => {
    if (quoteForDeletion) {
      deleteMutation.mutate(quoteForDeletion.id, {
        onSuccess: () => {
          toast.success('Quote deleted successfully');
          setDeleteDialogOpen(false);
          setQuoteForDeletion(null);
        }
      });
    }
  };

  const handleDelete = (quote: SupplierQuote) => {
    setQuoteForDeletion(quote);
    setDeleteDialogOpen(true);
  };

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
      cell: ({ row }) => {
        const status = row.getValue("status") as SupplierQuoteStatus;
        const getStatusColor = () => {
          switch (status) {
            case "draft": return "bg-gray-100 text-gray-800";
            case "submitted": return "bg-blue-100 text-blue-800";
            case "approved": return "bg-green-100 text-green-800";
            case "rejected": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
          }
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      accessorKey: "total_cost",
      header: "Total Cost",
      cell: ({ row }) => {
        const cost = row.getValue("total_cost");
        const currency = row.original.currency || "USD";
        
        if (!cost) return "Not calculated";
        
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 2
        });
        
        return formatter.format(cost as number);
      }
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
        const quote = row.original;
        return (
          <SupplierQuoteActions 
            quote={quote}
            onView={handleView}
            onEdit={handleEdit}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredQuotes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination: {
        pageSize,
        pageIndex: 0
      }
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

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {filteredQuotes.length} quote(s) {statusFilter && `with status ${statusFilter.join(', ')}`}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
              }}
              className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {[10, 25, 50].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {showDetails && selectedQuote && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <SupplierQuoteDetails 
              quote={selectedQuote} 
              onClose={() => setShowDetails(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {showEditDialog && selectedQuote && selectedQuote.quote_request && (
        <SupplierQuoteDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          quoteRequest={selectedQuote.quote_request as QuoteRequest}
          existingQuote={selectedQuote}
          mode="edit"
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quote? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
