
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
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SupplierTableProps {
  searchQuery: string;
  filters: FilterOptions;
  organizationId: string | undefined;
  onEditSupplier: (supplierId: string) => void;
  onAddSupplier: () => void;
  refreshTrigger?: number;
}

type SortField = 'supplier_name' | 'created_at' | 'status';
type SortDirection = 'asc' | 'desc';

export function SupplierTable({
  searchQuery,
  filters,
  organizationId,
  onEditSupplier,
  onAddSupplier,
  refreshTrigger = 0,
}: SupplierTableProps) {
  const [sortField, setSortField] = useState<SortField>('supplier_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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

    const { data, error } = await query.order(sortField, { ascending: sortDirection === 'asc' });

    if (error) {
      console.error("Error fetching suppliers:", error);
      throw new Error(error.message);
    }

    return data as Supplier[];
  };

  const { data: suppliers, isLoading, error, refetch } = useQuery({
    queryKey: ["suppliers", organizationId, searchQuery, filters, refreshTrigger, sortField, sortDirection],
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

  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />;
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
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-1 -ml-3 font-medium flex items-center"
                onClick={() => handleSort('supplier_name')}
              >
                Supplier Name {renderSortIcon('supplier_name')}
              </Button>
            </TableHead>
            <TableHead>Contact Name</TableHead>
            <TableHead>Contact Email</TableHead>
            <TableHead>Contact Phone</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-1 -ml-3 font-medium flex items-center"
                onClick={() => handleSort('status')}
              >
                Status {renderSortIcon('status')}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-1 -ml-3 font-medium flex items-center"
                onClick={() => handleSort('created_at')}
              >
                Created {renderSortIcon('created_at')}
              </Button>
            </TableHead>
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
