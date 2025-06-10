
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

// Define proper status filter types
type StatusFilter = 'all' | 'pending' | 'approved' | 'declined';

const QuoteRequests = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedQuoteRequest, setSelectedQuoteRequest] = useState<QuoteRequest | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  
  const { currentOrganization, isLoading: isLoadingOrganization } = useOrganization();
  const { useQuoteRequestsList, useUpdateQuoteRequestStatus, useDeleteQuoteRequest } = useQuoteRequests();
  
  // Fix hook parameters - provide all 5 parameters as expected
  const { 
    data: rawQuoteRequests = [], 
    isLoading: isLoadingQuotes, 
    isError: isErrorQuotes,
    error: errorQuotes 
  } = useQuoteRequestsList(
    currentOrganization, 
    statusFilter !== 'all' ? statusFilter : undefined, 
    searchQuery,
    undefined, // users parameter
    undefined  // supplier parameter
  );

  // Add runtime type validation and safety checks
  const validatedQuoteRequests = useMemo(() => {
    try {
      if (!Array.isArray(rawQuoteRequests)) {
        console.warn('Quote requests data is not an array:', rawQuoteRequests);
        return [];
      }

      return rawQuoteRequests.filter((request): request is QuoteRequest => {
        // Basic validation to ensure we have required fields
        return (
          request &&
          typeof request === 'object' &&
          typeof request.id === 'string' &&
          typeof request.title === 'string' &&
          ['pending', 'approved', 'declined'].includes(request.status)
        );
      });
    } catch (error) {
      console.error('Error validating quote requests:', error);
      return [];
    }
  }, [rawQuoteRequests]);

  const { sortField, sortDirection, handleSort, sortedQuoteRequests } = useQuoteRequestSort(validatedQuoteRequests);

  const updateStatusMutation = useUpdateQuoteRequestStatus();
  const deleteQuoteRequestMutation = useDeleteQuoteRequest();

  const onRowsSelected = (rows: string[]) => {
    setSelectedRows(rows);
  };

  const handleRowClick = (quoteRequest: QuoteRequest) => {
    try {
      setSelectedQuoteRequest(quoteRequest);
      setIsDetailsSheetOpen(true);
    } catch (error) {
      console.error('Error handling row click:', error);
    }
  };

  const handleStatusChange = (id: string, status: "approved" | "declined" | "pending") => {
    try {
      updateStatusMutation.mutate({ id, status });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteQuoteRequestMutation.mutate(id);
    } catch (error) {
      console.error('Error deleting quote request:', error);
    }
  };

  const handleEdit = (request: QuoteRequest) => {
    // Implementation for editing
    console.log('Edit request:', request);
  };

  const handleSelectAll = (selected: boolean) => {
    try {
      if (selected) {
        setSelectedRows(sortedQuoteRequests.map(r => r.id));
      } else {
        setSelectedRows([]);
      }
    } catch (error) {
      console.error('Error selecting all rows:', error);
    }
  };

  const handleSelectRow = (id: string, selected: boolean) => {
    try {
      if (selected) {
        setSelectedRows(prev => [...prev, id]);
      } else {
        setSelectedRows(prev => prev.filter(rowId => rowId !== id));
      }
    } catch (error) {
      console.error('Error selecting row:', error);
    }
  };

  const closeDetailsSheet = () => {
    setIsDetailsSheetOpen(false);
  };

  // Enhanced error handling
  if (isErrorQuotes) {
    const errorMessage = errorQuotes?.message || 'Failed to load quote requests. Please try again later.';
    
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  // Handle status filter change with proper typing
  const handleStatusFilterChange = (value: string) => {
    if (value === 'all' || value === 'pending' || value === 'approved' || value === 'declined') {
      setStatusFilter(value as StatusFilter);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <QuoteFilters
          filterOption="supplier"
          options={[]}
          value={statusFilter}
          onChange={handleStatusFilterChange}
        />
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Quote Request
        </Button>
      </div>

      {selectedRows.length > 0 && (
        <BulkActions 
          selectedIds={selectedRows}
          onClearSelection={() => setSelectedRows([])}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <QuoteRequestTableHeader 
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
            selectedRows={selectedRows}
            allRowIds={sortedQuoteRequests.map(r => r.id)}
            onSelectAll={handleSelectAll}
          />
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
            ) : sortedQuoteRequests.length > 0 ? (
              sortedQuoteRequests.map((quoteRequest) => (
                <QuoteRequestRow
                  key={quoteRequest.id}
                  request={quoteRequest}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onViewDetails={handleRowClick}
                  onEdit={handleEdit}
                  isSelected={selectedRows.includes(quoteRequest.id)}
                  onSelectRow={handleSelectRow}
                />
              ))
            ) : (
              <EmptyState isLoading={false} />
            )}
          </TableBody>
        </Table>
      </div>

      <QuoteRequestDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />

      <QuoteDetailsSheet
        isOpen={isDetailsSheetOpen}
        onClose={closeDetailsSheet}
        quoteRequest={selectedQuoteRequest}
      />
    </div>
  );
};

export default QuoteRequests;
