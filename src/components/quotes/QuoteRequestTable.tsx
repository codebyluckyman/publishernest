
import { useState } from "react";
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
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuoteRequestsApi } from "@/hooks/useQuoteRequestsApi";

interface QuoteRequestTableProps {
  quoteRequests: QuoteRequest[];
  isLoading: boolean;
}

export function QuoteRequestTable({ quoteRequests, isLoading }: QuoteRequestTableProps) {
  const { useUpdateQuoteRequestStatus, useDeleteQuoteRequest } = useQuoteRequestsApi();
  const updateStatusMutation = useUpdateQuoteRequestStatus();
  const deleteMutation = useDeleteQuoteRequest();

  const handleStatusChange = (id: string, status: 'approved' | 'declined' | 'pending') => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this quote request?")) {
      deleteMutation.mutate(id);
    }
  };

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quoteRequests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.title}</TableCell>
            <TableCell>{request.supplier_name}</TableCell>
            <TableCell>
              {format(new Date(request.requested_at), "MMM d, yyyy")}
            </TableCell>
            <TableCell>{getStatusBadge(request.status)}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
  );
}
