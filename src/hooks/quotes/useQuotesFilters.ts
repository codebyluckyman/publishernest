
import { useState } from 'react';
import { SortQuoteField, SortDirection, QuoteStatus } from '@/types/quote';

export const useQuotesFilters = () => {
  const [sortField, setSortField] = useState<SortQuoteField>('quote_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteRequestFilter, setQuoteRequestFilter] = useState<string | null>(null);

  const handleSort = (field: SortQuoteField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    sortField,
    sortDirection,
    statusFilter,
    searchQuery,
    quoteRequestFilter,
    handleSort,
    setStatusFilter,
    setSearchQuery,
    setQuoteRequestFilter
  };
};
