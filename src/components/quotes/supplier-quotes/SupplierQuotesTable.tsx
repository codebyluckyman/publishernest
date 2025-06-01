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
import { formatDate, formatCurrency } from "@/utils/formatters";
import { useOrganization } from "@/context/OrganizationContext";
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
import { Textarea } from "@/components/ui/textarea";
import { FormatCountButton } from "../table/FormatCountButton";
import { useQuoteRequestManagement } from "@/hooks/useQuoteRequestManagement";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface SupplierQuotesTableProps {
  statusFilter?: SupplierQuoteStatus[];
  searchQuery?: string;
  quoteRequestId?: string | null;
  supplier: string | null;
  selectedFormat: string | null;
}

export function SupplierQuotesTable({
  statusFilter,
  searchQuery,
  quoteRequestId,
  supplier,
  selectedFormat,
}: SupplierQuotesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteForDeletion, setQuoteForDeletion] =
    useState<SupplierQuote | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [quoteForRejection, setQuoteForRejection] =
    useState<SupplierQuote | null>(null);

  const { currentOrganization } = useOrganization();
  const navigate = useNavigate();
  const {
    useSupplierQuotesList,
    useSubmitSupplierQuote,
    useDeleteSupplierQuote,
    useApproveSupplierQuote,
    useRejectSupplierQuote,
  } = useSupplierQuotes();
  const { viewDetails } = useQuoteRequestManagement();
  const submitMutation = useSubmitSupplierQuote();
  const deleteMutation = useDeleteSupplierQuote();
  const approveMutation = useApproveSupplierQuote();
  const rejectMutation = useRejectSupplierQuote();

  const {
    data: quotes = [],
    isLoading,
    refetch,
  } = useSupplierQuotesList(
    currentOrganization,
    statusFilter ? statusFilter.join(",") : undefined,
    undefined,
    quoteRequestId || undefined,
    searchQuery,
    supplier,
    selectedFormat
  );

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleViewDetails = (quote: SupplierQuote) => {
    navigate(`/supplier-quotes/${quote.id}`);
  };

  const handleSubmit = (quote: SupplierQuote) => {
    submitMutation.mutate(
      {
        id: quote.id,
        totalCost: quote.total_cost || 0,
      },
      {
        onSuccess: () => {
          toast.success("Quote submitted successfully");
        },
      }
    );
  };

  const handleApprove = (quote: SupplierQuote) => {
    approveMutation.mutate(
      {
        id: quote.id,
        approvedCost: quote.total_cost || 0,
      },
      {
        onSuccess: () => {
          toast.success("Quote approved successfully");
        },
      }
    );
  };

  const handleReject = (quote: SupplierQuote) => {
    setQuoteForRejection(quote);
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (quoteForRejection && rejectionReason.trim()) {
      rejectMutation.mutate(
        {
          id: quoteForRejection.id,
          reason: rejectionReason,
        },
        {
          onSuccess: () => {
            toast.success("Quote rejected successfully");
            setRejectDialogOpen(false);
            setRejectionReason("");
            setQuoteForRejection(null);
          },
        }
      );
    } else {
      toast.error("Please provide a reason for rejection");
    }
  };

  const confirmDelete = () => {
    if (quoteForDeletion) {
      deleteMutation.mutate(quoteForDeletion.id, {
        onSuccess: () => {
          toast.success("Quote deleted successfully");
          setDeleteDialogOpen(false);
          setQuoteForDeletion(null);
        },
      });
    }
  };

  const handleDelete = (quote: SupplierQuote) => {
    setQuoteForDeletion(quote);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (quote: SupplierQuote) => {
    // setSelectedQuote(quote);
    // setShowEditDialog(true);
  };

  const filteredQuotes = useMemo(() => {
    if (!searchQuery) return quotes;

    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    return (
      quotes?.filter((quote) => {
        // Include the reference in the search
        const supplierName = quote.supplier?.supplier_name?.toLowerCase();
        const reference = quote.reference?.toLowerCase();
        const referenceId = quote.reference_id?.toLowerCase();
        const title = quote?.quote_request?.title?.toLowerCase();

        return (
          (supplierName && supplierName.includes(lowerCaseSearchQuery)) ||
          (title && title.includes(lowerCaseSearchQuery)) ||
          (reference && reference.includes(lowerCaseSearchQuery)) ||
          (referenceId && referenceId.includes(lowerCaseSearchQuery))
        );
      }) ?? []
    );
  }, [searchQuery, quotes]);

  useEffect(() => {
    refetch;
  }, [supplier]);

  const columns: ColumnDef<SupplierQuote>[] = [
    {
      accessorKey: "supplier_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-[120px]"
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
      accessorKey: "reference",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-[120px]"
        >
          Reference
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUp className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const reference = row.getValue("reference");
        const referenceId = row.original.reference_id;
        return (
          <div className="min-w-[120px]">
            {reference ? (
              <span>{reference as string}</span>
            ) : (
              <span className="text-muted-foreground font-mono text-sm">{referenceId || "N/A"}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as SupplierQuoteStatus;
        const getStatusColor = () => {
          switch (status) {
            case "draft":
              return "bg-gray-100 text-gray-800";
            case "submitted":
              return "bg-blue-100 text-blue-800";
            case "approved":
              return "bg-green-100 text-green-800";
            case "rejected":
              return "bg-red-100 text-red-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        };
        return (
          <Badge className={getStatusColor()}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "total_cost",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-[100px]"
        >
          Total Cost
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUp className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const amount = row.getValue("total_cost") as number;
        const currency = row.original.currency;
        return amount ? formatCurrency(amount, currency) : "Not calculated";
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-[100px]"
        >
          Created
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
      accessorKey: "title",
      header: "Quote Request",
      cell: ({ row }) => {
        const quote = row.original;
        const title = quote.title || quote.quote_request?.title;
        return (
          <div className="min-w-[200px]">
            <div className="font-medium">{title || "Untitled"}</div>
            {quote.formats && quote.formats.length > 0 && (
              <FormatCountButton
                formats={quote.formats.map(f => ({ 
                  id: f.id,
                  quote_request_id: quote.quote_request_id,
                  format_id: f.format_id,
                  notes: null,
                  format_name: f.format_name,
                  products: [],
                  price_breaks: []
                }))}
                request={null}
                onClick={() => {}}
              />
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const quote = row.original;
        return (
          <SupplierQuoteActions
            quote={quote}
            onViewDetails={() => handleViewDetails(quote)}
            onEdit={() => handleEdit(quote)}
            onSubmit={() => handleSubmit(quote)}
            onApprove={() => handleApprove(quote)}
            onReject={() => handleReject(quote)}
            onDelete={() => handleDelete(quote)}
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
    onPaginationChange: setPagination,
    state: {
      pagination,
      sorting,
    },
  });

  return (
    <div className="w-full">
      <div className="overflow-x-auto" style={{ minWidth: "100%" }}>
        <div className="rounded-md border min-w-[1200px]">
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
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewDetails(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={
                          cell.column.id === "actions"
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {filteredQuotes.length} quote(s){" "}
          {statusFilter && `with status ${statusFilter.join(", ")}`}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>

            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {[10, 25, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
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
              disabled={
                isLoading ||
                (!table.getCanNextPage() && filteredQuotes.length > 0)
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quote? This action cannot be
              undone.
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

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this quote:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Rejection reason"
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRejectionReason("");
                setRejectDialogOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={!rejectionReason.trim()}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
