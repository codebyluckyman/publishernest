
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { SelectFilter } from '@/components/common/SelectFilter';
import { useCustomers } from '@/hooks/useCustomers';

interface SalesOrderFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCustomer: string;
  onCustomerChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function SalesOrderFilters({
  searchQuery,
  onSearchChange,
  selectedCustomer,
  onCustomerChange,
  selectedStatus,
  onStatusChange,
  onClearFilters,
  hasActiveFilters,
}: SalesOrderFiltersProps) {
  const { customers, isLoadingCustomers } = useCustomers();

  const customerOptions = [
    { value: 'all', label: 'All Customers' },
    ...customers.map(customer => ({
      value: customer.id,
      label: customer.customer_name,
    })),
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        {/* Search Input */}
        <div className="relative min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by SO number or customer..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customer Filter */}
        <div className="min-w-[200px]">
          <Combobox
            items={customerOptions}
            value={selectedCustomer}
            onChange={onCustomerChange}
            placeholder="Select customer..."
            searchPlaceholder="Search customers..."
            emptyMessage="No customers found."
            isLoading={isLoadingCustomers}
          />
        </div>

        {/* Status Filter */}
        <div className="min-w-[150px]">
          <SelectFilter
            value={selectedStatus}
            onValueChange={onStatusChange}
            options={statusOptions}
            placeholder="Select status..."
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
