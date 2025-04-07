
import { useState, useEffect, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Eye, Edit, Trash2 } from "lucide-react";
import { SupplierQuote, SupplierQuoteStatus } from "@/types/supplierQuote";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SupplierQuoteDetails } from "./SupplierQuoteDetails";
import { SupplierQuoteDialog } from "./SupplierQuoteDialog";
import { useOrganization } from "@/context/OrganizationContext";
import { useNavigate } from "react-router-dom";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const { currentOrganization } = useOrganization();
  const { useSupplierQuotesList, useDeleteSupplierQuote } = useSupplierQuotes();
  const navigate = useNavigate();
  
  const deleteQuoteMutation = useDeleteSupplierQuote();
  
  // Use the existing hook with appropriate filters
  const { data: quotes = [], isLoading } = useSupplierQuotesList(
    currentOrganization,
    statusFilter ? statusFilter.join(',') : undefined,
    undefined,
    quoteRequestId || undefined,
    searchQuery
  );
  
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

  const handleOpenDetails = (supplierQuote: SupplierQuote) => {
    setSelectedQuote(supplierQuote);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };
  
  const handleEditQuote = (supplierQuote: SupplierQuote) => {
    setSelectedQuote(supplierQuote);
    setShowEditDialog(true);
  };
  
  const handleDeleteConfirm = () => {
    if (quoteToDelete) {
      deleteQuoteMutation.mutate(quoteToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setQuoteToDelete(null);
        }
      });
    }
  };
  
  const handleDeleteClick = (id: string) => {
    setQuoteToDelete(id);
    setDeleteDialogOpen(true);
  };

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
        const status = row.getValue("status") as string;
        return (
          <div className="flex items-center">
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${status === 'submitted' ? 'bg-blue-100 text-blue-800' : ''}
              ${status === 'approved' ? 'bg-green-100 text-green-800' : ''}
              ${status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
            `}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: "total_cost",
      header: "Total Cost",
      cell: ({ row }) => {
        const totalCost = row.getValue("total_cost");
        const currency = row.original.currency || "USD";
        
        if (totalCost === null) return "Not set";
        
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency
        }).format(totalCost as number);
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
        const supplierQuote = row.original;
        const isDraft = supplierQuote.status === 'draft';
        
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenDetails(supplierQuote)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            {isDraft && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleEditQuote(supplierQuote)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" 
                  onClick={() => handleDeleteClick(supplierQuote.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

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
      
      {showEditDialog && selectedQuote && (
        <SupplierQuoteDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          quoteId={selectedQuote.id}
          quoteRequestId={selectedQuote.quote_request_id}
          supplierId={selectedQuote.supplier_id}
          mode="edit"
        />
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier quote
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteQuoteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
