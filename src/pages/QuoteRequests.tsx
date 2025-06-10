
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
  const { useQuoteRequestsList } = useQuoteRequests();
  
  const { 
    data: quoteRequests = [], 
    isLoading: isLoadingQuotes, 
    isError: isErrorQuotes,
    error: errorQuotes 
  } = useQuoteRequestsList(currentOrganization, statusFilter !== 'all' ? statusFilter : undefined, searchQuery);

  const { sortField, sortDirection, handleSort, sortedQuoteRequests } = useQuoteRequestSort(quoteRequests);

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
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Quote Request
        </Button>
      </div>

      {selectedRows.length > 0 && (
        <BulkActions 
          onBulkAction={() => {}}
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
                onSort={handleSort}
                onSelectAll={() => {}}
                selectedCount={selectedRows.length}
                totalCount={sortedQuoteRequests.length}
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
                  id={quoteRequest.id}
                  title={quoteRequest.title}
                  status={quoteRequest.status}
                  createdAt={quoteRequest.created_at}
                  isSelected={selectedRows.includes(quoteRequest.id)}
                  onClick={() => handleRowClick(quoteRequest)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedRows(prev => [...prev, quoteRequest.id]);
                    } else {
                      setSelectedRows(prev => prev.filter(id => id !== quoteRequest.id));
                    }
                  }}
                />
              ))
            ) : (
              <EmptyState isLoading={false} />
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
