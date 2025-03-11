
import { useState } from 'react';
import { SortQuoteRequestField, SortDirection } from '@/types/quoteRequest';

interface FilterOptions {
  status: null | string;
  dueDate: null | string;
  [key: string]: any;
}

export const useQuoteRequestsFilter = (
  initialFilters: FilterOptions = { status: null, dueDate: null },
  initialSort: SortQuoteRequestField = 'created_at',
  initialDirection: SortDirection = 'desc'
) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [sortField, setSortField] = useState<SortQuoteRequestField>(initialSort);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSort = (field: SortQuoteRequestField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setFilters({
      status: null,
      dueDate: null,
    });
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const areFiltersActive = () => {
    return !!filters.status || !!filters.dueDate;
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return {
    filters,
    setFilters,
    sortField,
    sortDirection,
    handleSort,
    searchQuery,
    setSearchQuery,
    refreshTrigger,
    handleRefresh,
    resetFilters,
    areFiltersActive,
    activeFiltersCount
  };
};
