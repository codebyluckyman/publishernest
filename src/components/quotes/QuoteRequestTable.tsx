import { useState, useCallback } from "react";
import { QuoteRequest } from "@/types/quoteRequest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { MoreHorizontal, CheckCircle, XCircle, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface QuoteRequestTableProps {
  quoteRequests: QuoteRequest[];
  isLoading: boolean;
}

export function QuoteRequestTable({ quoteRequests, isLoading }: QuoteRequestTableProps) {
  const { useUpdateQuoteRequestStatus, useDeleteQuoteRequest } = useQuoteRequests();
  const updateStatusMutation = useUpdateQuoteRequestStatus();
  const deleteMutation = useDeleteQuoteRequest();
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState<Record<string, boolean>>({});

  const handleStatusChange = useCallback((id: string, status: 'approved' | 'declined' | 'pending') => {
    setIsMenuOpen(prev => ({ ...prev, [id]: false }));
    updateStatusMutation.mutate({ id, status });
  }, [updateStatusMutation]);

  const handleDelete = useCallback((id: string) => {
    setIsMenuOpen(prev => ({ ...prev, [id]: false }));
    if (window.confirm("Are you sure you want to delete this quote request?")) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const viewDetails = useCallback((request: QuoteRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  }, []);

  const viewDetailsFromDropDown = useCallback((request: QuoteRequest, id: string) => {
    setIsMenuOpen(prev => ({ ...prev, [id]: false }));
    setSelectedRequest(request);
    setDetailsOpen(true);
  }, []);

  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
    setTimeout(() => {
      setSelectedRequest(null);
    }, 300);
  }, []);

  const toggleMenu = useCallback((id: string, isOpen: boolean) => {
    setIsMenuOpen(prev => ({ ...prev, [id]: isOpen }));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Approved</Badge>;
      case "declined":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatSupplierDisplay = (request: QuoteRequest) => {
    if (request.supplier_ids && request.supplier_ids.length > 1) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              {request.supplier_ids.length} suppliers
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-2 w-fit">
            <div className="text-sm font-medium mb-2">Suppliers:</div>
            <div className="space-y-1">
              {request.supplier_names && request.supplier_names.map((name, index) => (
                <div key={index} className="text-sm">{name}</div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    }
    
    return request.supplier_names && request.supplier_names.length > 0 
      ? request.supplier_names[0] 
      : request.supplier_name || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading quote requests...</p>
      </div>
    );
  }

  if (quoteRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-medium">No quote requests found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new quote request to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Supplier(s)</TableHead>
            <TableHead>Date Requested</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Formats</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quoteRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.title}</TableCell>
              <TableCell>{formatSupplierDisplay(request)}</TableCell>
              <TableCell>
                {format(new Date(request.requested_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {request.due_date 
                  ? format(new Date(request.due_date), "MMM d, yyyy") 
                  : "Not set"}
              </TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>
                {request.formats && request.formats.length > 0 ? (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="hover:bg-secondary/80" 
                    onClick={() => viewDetails(request)}
                  >
                    {request.formats.length} format{request.formats.length !== 1 ? 's' : ''}
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-sm">None</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu 
                  open={isMenuOpen[request.id]} 
                  onOpenChange={(open) => toggleMenu(request.id, open)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => viewDetailsFromDropDown(request, request.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>View Details</span>
                    </DropdownMenuItem>
                    {request.status !== "approved" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(request.id, "approved")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span>Approve</span>
                      </DropdownMenuItem>
                    )}
                    {request.status !== "declined" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(request.id, "declined")}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        <span>Decline</span>
                      </DropdownMenuItem>
                    )}
                    {request.status !== "pending" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(request.id, "pending")}
                      >
                        <span>Mark as Pending</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(request.id)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={detailsOpen} onOpenChange={closeDetails}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Quote Request Details</SheetTitle>
          </SheetHeader>
          
          {selectedRequest && (
            <div className="space-y-4 mt-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                <p className="mt-1">{selectedRequest.title}</p>
              </div>
              
              {selectedRequest.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="mt-1">{selectedRequest.description}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Supplier(s)</h3>
                {selectedRequest.supplier_names && selectedRequest.supplier_names.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {selectedRequest.supplier_names.map((name, index) => (
                      <div key={index}>{name}</div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1">{selectedRequest.supplier_name || 'Unknown'}</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date Requested</h3>
                <p className="mt-1">{selectedRequest.requested_at ? format(new Date(selectedRequest.requested_at), "PPP") : 'N/A'}</p>
              </div>
              
              {selectedRequest.due_date && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  <p className="mt-1">{format(new Date(selectedRequest.due_date), "PPP")}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Formats</h3>
                {selectedRequest.formats && selectedRequest.formats.length > 0 ? (
                  <div className="border rounded-md divide-y">
                    {selectedRequest.formats.map((format) => (
                      <div key={format.id} className="p-3">
                        <div className="flex justify-between">
                          <span className="font-medium">{format.format_name}</span>
                          <span>Qty: {format.quantity}</span>
                        </div>
                        {format.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{format.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No formats associated with this request.</p>
                )}
              </div>
              
              {selectedRequest.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Additional Notes</h3>
                  <p className="mt-1">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
