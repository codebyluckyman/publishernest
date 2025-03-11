
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Format, FormatTableRow } from "./FormatTableRow";
import { FormatEmptyState } from "./FormatEmptyState";
import { FilterOptions } from "./FormatFilters";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormatTableProps {
  searchQuery: string;
  filters: FilterOptions;
  organizationId: string | undefined;
  onViewFormat: (formatId: string) => void;
  onEditFormat: (formatId: string) => void;
  onAddFormat: () => void;
  setFilterOptions: React.Dispatch<React.SetStateAction<{
    cover_stock_print: string[];
    internal_stock_print: string[];
  }>>;
  refreshTrigger?: number;
}

type SortField = 'format_name' | 'created_at' | 'extent_pages';
type SortDirection = 'asc' | 'desc';

export function FormatTable({
  searchQuery,
  filters,
  organizationId,
  onViewFormat,
  onEditFormat,
  onAddFormat,
  setFilterOptions,
  refreshTrigger = 0
}: FormatTableProps) {
  const [sortField, setSortField] = useState<SortField>('format_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const fetchFormats = async () => {
    if (!organizationId) {
      return [];
    }

    let query = supabase
      .from("formats")
      .select("*")
      .eq("organization_id", organizationId);

    if (searchQuery) {
      query = query.ilike("format_name", `%${searchQuery}%`);
    }

    if (filters.cover_stock_print) {
      query = query.eq("cover_stock_print", filters.cover_stock_print);
    }
    if (filters.internal_stock_print) {
      query = query.eq("internal_stock_print", filters.internal_stock_print);
    }

    // Apply sorting based on current sort field and direction
    const { data, error } = await query.order(sortField, { ascending: sortDirection === 'asc' });

    if (error) {
      console.error("Error fetching formats:", error);
      throw new Error(error.message);
    }

    return data as Format[];
  };

  const { data: formats, isLoading, error, refetch } = useQuery({
    queryKey: ["formats", organizationId, searchQuery, filters, refreshTrigger, sortField, sortDirection],
    queryFn: fetchFormats,
    enabled: !!organizationId,
  });

  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("Refresh trigger changed, refetching formats data");
      refetch();
    }
  }, [refreshTrigger, refetch]);

  useEffect(() => {
    if (formats && formats.length > 0) {
      const coverStockOptions = Array.from(
        new Set(formats.map((format) => format.cover_stock_print).filter(Boolean))
      ) as string[];
      
      const internalStockOptions = Array.from(
        new Set(formats.map((format) => format.internal_stock_print).filter(Boolean))
      ) as string[];

      setFilterOptions({
        cover_stock_print: coverStockOptions,
        internal_stock_print: internalStockOptions,
      });
    }
  }, [formats, setFilterOptions]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load formats: " + (error as Error).message);
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

  if (!formats || formats.length === 0) {
    return <FormatEmptyState hasOrganization={!!organizationId} onAddFormat={onAddFormat} />;
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
                onClick={() => handleSort('format_name')}
              >
                Format Name {renderSortIcon('format_name')}
              </Button>
            </TableHead>
            <TableHead>TPS Dimensions</TableHead>
            <TableHead>PLC Dimensions</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-1 -ml-3 font-medium flex items-center"
                onClick={() => handleSort('extent_pages')}
              >
                Extent {renderSortIcon('extent_pages')}
              </Button>
            </TableHead>
            <TableHead>Cover Stock/Print</TableHead>
            <TableHead>Internal Stock/Print</TableHead>
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
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formats.map((format) => (
            <FormatTableRow
              key={format.id}
              format={format}
              onViewFormat={onViewFormat}
              onEditFormat={onEditFormat}
              formatDate={formatDate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
