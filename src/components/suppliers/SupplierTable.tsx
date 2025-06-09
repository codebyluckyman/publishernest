
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Supplier } from "@/types/supplier";
import { SupplierTableRow } from "./SupplierTableRow";
import { SupplierEmptyState } from "./SupplierEmptyState";
import { FilterOptions } from "./SupplierFilters";
import { SortableTableHeader } from "@/components/common/SortableTableHeader";
import { SupplierSortField, SortDirection, SortConfig } from "@/types/sorting";

interface SupplierTableProps {
  searchQuery: string;
  filters: FilterOptions;
  organizationId: string | undefined;
  onEditSupplier: (supplierId: string) => void;
  onAddSupplier: () => void;
  refreshTrigger?: number;
}

export function SupplierTable({
  searchQuery,
  filters,
  organizationId,
  onEditSupplier,
  onAddSupplier,
  refreshTrigger = 0,
}: SupplierTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig<SupplierSortField>>({
    field: 'supplier_name',
    direction: 'asc'
  });

  const handleSort = (field: SupplierSortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const fetchSuppliers = async () => {
    if (!organizationId) {
      return [];
    }

    let query = supabase
      .from("suppliers")
      .select("*")
      .eq("organization_id", organizationId);

    if (searchQuery) {
      query = query.ilike("supplier_name", `%${searchQuery}%`);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query.order(sortConfig.field, { ascending: sortConfig.direction === 'asc' });

    if (error) {
      console.error("Error fetching suppliers:", error);
      throw new Error(error.message);
    }

    return data as Supplier[];
  };

  const { data: suppliers, isLoading, error, refetch } = useQuery({
    queryKey: ["suppliers", organizationId, searchQuery, filters, refreshTrigger, sortConfig.field, sortConfig.direction],
    queryFn: fetchSuppliers,
    enabled: !!organizationId,
  });

  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load suppliers: " + (error as Error).message);
    }
  }, [error]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!suppliers || suppliers.length === 0) {
    return <SupplierEmptyState hasOrganization={!!organizationId} onAddSupplier={onAddSupplier} />;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHeader
              field="supplier_name"
              label="Supplier Name"
              currentSortField={sortConfig.field}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            />
            <TableHead>Contact Name</TableHead>
            <TableHead>Contact Email</TableHead>
            <TableHead>Contact Phone</TableHead>
            <SortableTableHeader
              field="status"
              label="Status"
              currentSortField={sortConfig.field}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            />
            <SortableTableHeader
              field="created_at"
              label="Created"
              currentSortField={sortConfig.field}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            />
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <SupplierTableRow
              key={supplier.id}
              supplier={supplier}
              onEditSupplier={onEditSupplier}
              formatDate={formatDate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
