
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SupplierQuoteRow } from './SupplierQuoteRow';
import { SupplierQuotesEmptyState } from './SupplierQuotesEmptyState';
import { useOrganization } from '@/context/OrganizationContext';
import { useSupplierQuotes } from '@/hooks/useSupplierQuotes';
import { SupplierQuote } from '@/types/supplierQuote';

interface SupplierQuotesTableProps {
  printRunId?: string;
  onDetailClick?: (quote: SupplierQuote) => void;
  onApprove?: (quote: SupplierQuote) => void;
  limitToSubmitted?: boolean;
}

export function SupplierQuotesTable({
  printRunId,
  onDetailClick,
  onApprove,
  limitToSubmitted = false,
}: SupplierQuotesTableProps) {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { useSupplierQuotesList } = useSupplierQuotes();

  const status = limitToSubmitted ? 'submitted' : undefined;

  const { data: response, isLoading } = useSupplierQuotesList(
    currentOrganization,
    status,
    undefined,
    printRunId,
    pageSize,
    page
  );

  if (!response) {
    return <div>No supplier quotes available</div>;
  }

  // Safely extract the data and count from the response
  const supplierQuotes: SupplierQuote[] = Array.isArray(response) ? response : 
    (response && 'data' in response && Array.isArray(response.data)) ? response.data : [];
    
  const totalCount = (response && 'count' in response) ? response.count || 0 : supplierQuotes.length;

  // If no quotes and loading, show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading supplier quotes...</p>
        </div>
      </div>
    );
  }

  // If no quotes and not loading, show empty state
  if (supplierQuotes.length === 0 && !isLoading) {
    return (
      <SupplierQuotesEmptyState 
        printRunId={printRunId}
        onCreateNew={() => {
          if (printRunId) {
            navigate(`/quotes/request/${printRunId}/supplier/new`);
          }
        }}
      />
    );
  }
  
  // Filter quotes based on search query
  const filteredQuotes = supplierQuotes.filter((quote) => {
    if (!searchQuery) return true;
    
    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    
    return (
      (quote.supplier?.name && quote.supplier.name.toLowerCase().includes(lowerCaseSearchQuery)) ||
      (quote.reference_id && quote.reference_id.toLowerCase().includes(lowerCaseSearchQuery)) ||
      (quote.status && quote.status.toLowerCase().includes(lowerCaseSearchQuery)) ||
      (quote.print_run?.title && quote.print_run.title.toLowerCase().includes(lowerCaseSearchQuery))
    );
  });

  // Calculate pagination details
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="relative max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search quotes..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {printRunId && (
          <Button
            onClick={() => navigate(`/quotes/request/${printRunId}/supplier/new`)}
          >
            Create Supplier Quote
          </Button>
        )}
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Print Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.map((quote) => (
              <SupplierQuoteRow
                key={quote.id}
                quote={quote}
                onDetailClick={() => {
                  if (onDetailClick) {
                    onDetailClick(quote);
                  } else {
                    navigate(`/quotes/supplier/${quote.id}`);
                  }
                }}
                onApprove={onApprove ? () => onApprove(quote) : undefined}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {startItem} to {endItem} of {totalCount} results
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
