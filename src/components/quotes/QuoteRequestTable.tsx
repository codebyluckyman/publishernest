
import { useState, useCallback, useMemo } from "react";
import { QuoteRequest, QuoteRequestFormValues, SortQuoteRequestField, SortDirection } from "@/types/quoteRequest";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
import { useSuppliersApi } from "@/hooks/useSuppliersApi";
import { useOrganization } from "@/hooks/useOrganization";
import { QuoteRequestRow } from "./table/QuoteRequestRow";
import { QuoteDetailsSheet } from "./table/QuoteDetailsSheet";
import { EditQuoteRequestDialog } from "./EditQuoteRequestDialog";
import { EmptyState } from "./table/EmptyState";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteRequestTableProps {
  quoteRequests: QuoteRequest[];
  isLoading: boolean;
}

export function QuoteRequestTable({ quoteRequests, isLoading }: QuoteRequestTableProps) {
  const { currentOrganization } = useOrganization();
  const { useUpdateQuoteRequestStatus, useDeleteQuoteRequest, useUpdateQuoteRequest } = useQuoteRequests();
  const updateStatusMutation = useUpdateQuoteRequestStatus();
  const deleteMutation = useDeleteQuoteRequest();
  const updateMutation = useUpdateQuoteRequest();
  const { data: suppliers = [] } = useSuppliersApi(currentOrganization);

  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortQuoteRequestField>("due_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleStatusChange = useCallback((id: string, status: 'approved' | 'declined' | 'pending') => {
    updateStatusMutation.mutate({ id, status });
  }, [updateStatusMutation]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this quote request?")) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const viewDetails = useCallback((request: QuoteRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  }, []);

  const editRequest = useCallback((request: QuoteRequest) => {
    setSelectedRequest(request);
    setEditOpen(true);
  }, []);

  const handleUpdateRequest = useCallback((id: string, data: QuoteRequestFormValues) => {
    updateMutation.mutate(
      { id, updates: data },
      {
        onSuccess: () => {
          setEditOpen(false);
        }
      }
    );
  }, [updateMutation]);

  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
    setTimeout(() => {
      setSelectedRequest(null);
    }, 300);
  }, []);

  // Handle sorting
  const handleSort = useCallback((field: SortQuoteRequestField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField, sortDirection]);

  // Sort the quote requests
  const sortedQuoteRequests = useMemo(() => {
    return [...quoteRequests].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "requested_at":
          comparison = new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "supplier_name":
          const supplierNameA = a.supplier_name || "";
          const supplierNameB = b.supplier_name || "";
          comparison = supplierNameA.localeCompare(supplierNameB);
          break;
        case "due_date":
          // Handle null due dates by placing them at the end
          if (!a.due_date && !b.due_date) {
            comparison = 0;
          } else if (!a.due_date) {
            comparison = 1; // a goes after b
          } else if (!b.due_date) {
            comparison = -1; // a goes before b
          } else {
            comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          }
          break;
        default:
          comparison = 0;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [quoteRequests, sortField, sortDirection]);

  // Render sort indicator
  const renderSortIndicator = (field: SortQuoteRequestField) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUp className="ml-1 h-4 w-4 inline" /> 
      : <ChevronDown className="ml-1 h-4 w-4 inline" />;
  };

  if (quoteRequests.length === 0) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button 
                variant="ghost" 
                className="p-0 font-medium"
                onClick={() => handleSort("title")}
              >
                Title {renderSortIndicator("title")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="p-0 font-medium"
                onClick={() => handleSort("supplier_name")}
              >
                Supplier(s) {renderSortIndicator("supplier_name")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="p-0 font-medium"
                onClick={() => handleSort("requested_at")}
              >
                Date Requested {renderSortIndicator("requested_at")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="p-0 font-medium"
                onClick={() => handleSort("due_date")}
              >
                Due Date {renderSortIndicator("due_date")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="p-0 font-medium"
                onClick={() => handleSort("status")}
              >
                Status {renderSortIndicator("status")}
              </Button>
            </TableHead>
            <TableHead>Formats</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedQuoteRequests.map((request) => (
            <QuoteRequestRow
              key={request.id}
              request={request}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onViewDetails={viewDetails}
              onEdit={editRequest}
            />
          ))}
        </TableBody>
      </Table>

      <QuoteDetailsSheet
        isOpen={detailsOpen}
        onOpenChange={closeDetails}
        selectedRequest={selectedRequest}
      />

      <EditQuoteRequestDialog
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        quoteRequest={selectedRequest}
        suppliers={suppliers}
        onSubmit={handleUpdateRequest}
        isSubmitting={updateMutation.isPending}
      />
    </>
  );
}
