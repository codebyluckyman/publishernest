
import React, { useState, useMemo } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus } from 'lucide-react';
import { 
  Table,
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { QuoteRequestDialog } from '@/components/quotes/QuoteRequestDialog';
import { QuoteRequestRow } from '@/components/quotes/table/QuoteRequestRow';
import { QuoteRequestTableHeader } from '@/components/quotes/table/QuoteRequestTableHeader';
import { EmptyState } from '@/components/quotes/table/EmptyState';
import { BulkActions } from '@/components/quotes/table/BulkActions';
import QuoteFilters from '@/components/quotes/QuoteFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuoteRequest } from '@/types/quoteRequest';
import { useQuoteRequestSort } from '@/hooks/useQuoteRequestSort';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuoteDetailsSheet } from '@/components/quotes/table/QuoteDetailsSheet';
import { useQuoteRequests } from '@/hooks/useQuoteRequests';

const QuoteRequests = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedQuoteRequest, setSelectedQuoteRequest] = useState<QuoteRequest | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  
  const { currentOrganization } = useOrganization();
  const { useQuoteRequestsList, useFetchSuppliers } = useQuoteRequests();
  
  // Fetch quote requests data
  const { 
    data: quoteRequests = [], 
    isLoading: isLoadingQuotes, 
    isError: isErrorQuotes,
    error: errorQuotes 
  } = useQuoteRequestsList(
    currentOrganization, 
    statusFilter !== 'all' ? statusFilter : undefined, 
    searchQuery
  );

  // Fetch suppliers for dialog
  const { data: suppliers = [] } = useFetchSuppliers();

  const { sortField, sortDirection, handleSort, sortedQuoteRequests } = useQuoteRequestSort(quoteRequests);

  const filteredQuoteRequests = useMemo(() => {
    let filtered = sortedQuoteRequests;

    if (searchQuery) {
      filtered = filtered.filter(qr =>
        qr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(qr => qr.status === statusFilter);
    }

    return filtered;
  }, [sortedQuoteRequests, searchQuery, statusFilter]);

  const allQuoteRequestIds = useMemo(() => filteredQuoteRequests.map(qr => qr.id), [filteredQuoteRequests]);

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(allQuoteRequestIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedRows(prev => [...prev, id]);
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id));
    }
  };

  const handleRowClick = (quoteRequest: QuoteRequest) => {
    setSelectedQuoteRequest(quoteRequest);
    setIsDetailsSheetOpen(true);
  };

  const closeDetailsSheet = () => {
    setIsDetailsSheetOpen(false);
    setSelectedQuoteRequest(null);
  };

  const handleBulkStatusChange = (status: "approved" | "declined" | "pending") => {
    // TODO: Implement bulk status change
    console.log('Bulk status change:', status, selectedRows);
  };

  const handleBulkDelete = () => {
    // TODO: Implement bulk delete
    console.log('Bulk delete:', selectedRows);
  };

  const handleStatusChange = (id: string, status: "approved" | "declined" | "pending") => {
    // TODO: Implement status change
    console.log('Status change:', id, status);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete
    console.log('Delete:', id);
  };

  const handleViewDetails = (request: QuoteRequest) => {
    setSelectedQuoteRequest(request);
    setIsDetailsSheetOpen(true);
  };

  const handleEdit = (request: QuoteRequest) => {
    // TODO: Implement edit
    console.log('Edit:', request);
  };

  const handleViewSupplierQuotes = (request: QuoteRequest) => {
    // TODO: Navigate to supplier quotes
    console.log('View supplier quotes:', request);
  };

  const clearSelection = () => {
    setSelectedRows([]);
  };

  const openDueDateDialog = () => {
    // TODO: Implement due date dialog
    console.log('Open due date dialog');
  };

  if (isErrorQuotes) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load quote requests. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search quote requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Quote Request
        </Button>
      </div>

      {selectedRows.length > 0 && (
        <BulkActions 
          selectedCount={selectedRows.length}
          onApprove={() => handleBulkStatusChange("approved")}
          onDecline={() => handleBulkStatusChange("declined")}
          onMarkPending={() => handleBulkStatusChange("pending")}
          onDelete={handleBulkDelete}
          onUpdateDueDate={openDueDateDialog}
          onClearSelection={clearSelection}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <QuoteRequestTableHeader 
                sortField={sortField}
                sortDirection={sortDirection}
                handleSort={handleSort}
                selectedRows={selectedRows}
                allRowIds={allQuoteRequestIds}
                onSelectAll={handleSelectAll}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingQuotes ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))
            ) : filteredQuoteRequests.length > 0 ? (
              filteredQuoteRequests.map((request) => (
                <QuoteRequestRow
                  key={request.id}
                  request={request}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  onViewSupplierQuotes={handleViewSupplierQuotes}
                  isSelected={selectedRows.includes(request.id)}
                  onSelectRow={handleSelectRow}
                />
              ))
            ) : (
              <EmptyState isLoading={isLoadingQuotes} />
            )}
          </TableBody>
        </Table>
      </div>

      <QuoteRequestDialog 
        suppliers={suppliers}
        onSuccess={() => {
          setIsDialogOpen(false);
          // Refresh data would happen automatically via React Query
        }}
      />

      <QuoteDetailsSheet
        isOpen={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
        selectedRequest={selectedQuoteRequest}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
        isSubmitting={false}
      />
    </div>
  );
};

export default QuoteRequests;
