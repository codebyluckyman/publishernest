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
import { SupplierQuoteDetailsSheet } from "./details/SupplierQuoteDetailsSheet";
import { Textarea } from "@/components/ui/textarea";
import { FormatCountButton } from "../table/FormatCountButton";
import { useQuoteRequestManagement } from "@/hooks/useQuoteRequestManagement";
import { Badge } from "@/components/ui/badge";

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
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(
    null
  );
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteForDeletion, setQuoteForDeletion] =
    useState<SupplierQuote | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [quoteForRejection, setQuoteForRejection] =
    useState<SupplierQuote | null>(null);

  const { currentOrganization } = useOrganization();
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

  useEffect(() => {
    if (!detailsSheetOpen) {
      setSelectedQuote(null);
    }
  }, [detailsSheetOpen]);

  useEffect(() => {
    if (!showEditDialog) {
      setSelectedQuote(null);
    }
  }, [showEditDialog]);

  useEffect(() => {
    refetch;
  }, [supplier]);

  const handleViewDetails = (quote: SupplierQuote) => {
    setSelectedQuote(quote);
    setDetailsSheetOpen(true);
  };

  const handleEdit = (quote: SupplierQuote) => {
    setSelectedQuote(quote);
    setShowEditDialog(true);
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
          setDetailsSheetOpen(false);
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
            setDetailsSheetOpen(false);
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

  const filteredQuotes = useMemo(() => {
    if (!searchQuery) return quotes;

    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    return (
      quotes?.filter((quote) => {
        // const supplierName = quote.supplier?.supplier_name?.toLowerCase();
        // const reference = quote.reference?.toLowerCase();
        // const referenceId = quote.reference_id?.toLowerCase();
        const title = quote?.quote_request?.title?.toLocaleLowerCase();

        return (
          // supplierName?.includes(lowerCaseSearchQuery) ||
          title?.includes(lowerCaseSearchQuery)
          // reference?.includes(lowerCaseSearchQuery) ||
          // referenceId?.includes(lowerCaseSearchQuery)
        );
      }) ?? []
    );
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
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "request_title",
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="justify-center"
            >
              Title
              {column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUp className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex flex-col">
            <span>{row.original?.quote_request?.title}</span>
            <span className="text-xs text-muted-foreground font-mono">
              {row.original?.reference_id || "No reference"}
            </span>
          </div>
        );
      },
      sortingFn: (rowA, rowB, id) => {
        const a = rowA.getValue(id) || "USD";
        const b = rowB.getValue(id) || "USD";
        return (a as string).localeCompare(b as string);
      },
    },
    {
      accessorKey: "currency",
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="justify-center"
            >
              Currency
              {column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUp className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const currencyCode = row.getValue("currency");
        return (
          <div className="text-center">{(currencyCode as string) || "USD"}</div>
        );
      },
      sortingFn: (rowA, rowB, id) => {
        const a = rowA.getValue(id) || "USD";
        const b = rowB.getValue(id) || "USD";
        return (a as string).localeCompare(b as string);
      },
    },
    {
      accessorKey: "valid_from",
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="justify-center"
            >
              Valid From
              {column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUp className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const validFrom = row.getValue("valid_from");
        let displayDate = "N/A";

        if (validFrom) {
          try {
            displayDate = new Date(validFrom as string).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );
          } catch {
            displayDate = validFrom as string;
          }
        }

        return <div className="text-center">{displayDate}</div>;
      },
      sortingFn: (rowA, rowB, id) => {
        const a = rowA.getValue(id);
        const b = rowB.getValue(id);

        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;

        try {
          const dateA = new Date(a as string);
          const dateB = new Date(b as string);
          return dateA.getTime() - dateB.getTime();
        } catch {
          return (a as string).localeCompare(b as string);
        }
      },
    },
    {
      accessorKey: "valid_to",
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="justify-center"
            >
              Valid To
              {column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUp className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const validTo = row.getValue("valid_to");
        let displayDate = "N/A";

        if (validTo) {
          try {
            displayDate = new Date(validTo as string).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );
          } catch {
            displayDate = validTo as string;
          }
        }

        return <div className="text-center">{displayDate}</div>;
      },
      sortingFn: (rowA, rowB, id) => {
        const a = rowA.getValue(id);
        const b = rowB.getValue(id);

        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;

        try {
          const dateA = new Date(a as string);
          const dateB = new Date(b as string);
          return dateA.getTime() - dateB.getTime();
        } catch {
          return (a as string).localeCompare(b as string);
        }
      },
    },
    {
      accessorKey: "format",
      header: () => <div className="text-center">Format</div>,
      cell: ({ row }: any) => {
        return (
          <div className="flex justify-center min-w-[200px] ">
            {row.original?.formats?.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {row.original?.formats?.map((item: any, index: number) => (
                  // <span key={index} className="px-2 py-1 rounded-full text-xs break-words font-medium bg-blue-100">
                  //   {item?.format_name}
                  // </span>
                  <Badge>{item?.format_name}</Badge>
                ))}
              </div>
            ) : (
              <div className="text-center">No Format</div>
            )}
          </div>
        );
      },
      enableSorting: false,
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
            onView={() => handleViewDetails(quote)}
            onEdit={() => handleEdit(quote)}
            onSubmit={() => handleSubmit(quote)}
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
    <div className="w-full overflow-x-auto">
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

      <SupplierQuoteDetailsSheet
        quote={selectedQuote}
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        onApprove={
          selectedQuote && selectedQuote.status === "submitted"
            ? handleApprove
            : undefined
        }
        onReject={
          selectedQuote && selectedQuote.status === "submitted"
            ? handleReject
            : undefined
        }
      />

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
