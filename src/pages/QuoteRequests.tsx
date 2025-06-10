import React, { useState, useMemo } from 'react';
import { useQuoteRequests } from '@/hooks/useQuoteRequests';
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
import { QuoteFilters } from '@/components/quotes/QuoteFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuoteRequest } from '@/types/quoteRequest';
import { useQuoteRequestSort } from '@/hooks/useQuoteRequestSort';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuoteDetailsSheet } from '@/components/quotes/table/QuoteDetailsSheet';

const QuoteRequests = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedQuoteRequest, setSelectedQuoteRequest] = useState<QuoteRequest | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  
  const { currentOrganization } = useOrganization();
  const { 
    quoteRequests, 
    isLoading: isLoadingQuotes, 
    isError: isErrorQuotes,
    error: errorQuotes 
  } = useQuoteRequests();

  const { sortConfig, handleSort } = useQuoteRequestSort();

  const filteredQuoteRequests = useMemo(() => {
    let filtered = quoteRequests;

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
  }, [quoteRequests, searchQuery, statusFilter]);

  const sortedQuoteRequests = useMemo(() => {
    if (!filteredQuoteRequests) return [];

    return [...filteredQuoteRequests].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [filteredQuoteRequests, sortConfig]);

  const onRowsSelected = (rows: string[]) => {
    setSelectedRows(rows);
  };

  const handleRowClick = (quoteRequest: QuoteRequest) => {
    setSelectedQuoteRequest(quoteRequest);
    setIsDetailsSheetOpen(true);
  };

  const closeDetailsSheet = () => {
    setIsDetailsSheetOpen(false);
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
        <QuoteFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Quote Request
        </Button>
      </div>

      {selectedRows.length > 0 && (
        <BulkActions 
          selectedRows={selectedRows} 
          setSelectedRows={setSelectedRows}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <QuoteRequestTableHeader 
                sortConfig={sortConfig} 
                handleSort={handleSort} 
                onRowsSelected={onRowsSelected} 
                selectedRows={selectedRows}
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
            ) : sortedQuoteRequests.length > 0 ? (
              sortedQuoteRequests.map((quoteRequest) => (
                <QuoteRequestRow
                  key={quoteRequest.id}
                  quoteRequest={quoteRequest}
                  selectedRows={selectedRows}
                  onRowClick={() => handleRowClick(quoteRequest)}
                  onRowsSelected={onRowsSelected}
                />
              ))
            ) : (
              <EmptyState />
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
