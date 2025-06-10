
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
import QuoteFilters from '@/components/quotes/QuoteFilters';
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
          filterOption="supplier"
          options={[]}
          value=""
          onChange={() => {}}
        />
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Quote Request
        </Button>
      </div>

      {selectedRows.length > 0 && (
        <BulkActions 
          selectedQuoteRequestIds={selectedRows} 
          onClearSelection={() => setSelectedRows([])}
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
            ) : filteredQuoteRequests.length > 0 ? (
              filteredQuoteRequests.map((quoteRequest) => (
                <QuoteRequestRow
                  key={quoteRequest.id}
                  quote={quoteRequest}
                  selectedRows={selectedRows}
                  onRowClick={() => handleRowClick(quoteRequest)}
                  onRowsSelected={onRowsSelected}
                />
              ))
            ) : (
              <EmptyState isLoading={isLoadingQuotes} />
            )}
          </TableBody>
        </Table>
      </div>

      <QuoteRequestDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
      />

      <QuoteDetailsSheet
        isOpen={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
        quoteRequest={selectedQuoteRequest}
      />
    </div>
  );
};

export default QuoteRequests;
