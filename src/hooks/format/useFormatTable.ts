
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Format } from "@/components/format/types/FormatTypes";
import { FilterOptions } from "@/components/format/FormatFilters";
import { SortField, SortDirection } from "@/components/format/table/SortableTableHead";

interface UseFormatTableProps {
  searchQuery: string;
  filters: FilterOptions;
  organizationId: string | undefined;
  refreshTrigger?: number;
  onSetFilterOptions: React.Dispatch<React.SetStateAction<{
    cover_stock_print: string[];
    internal_stock_print: string[];
  }>>;
}

export function useFormatTable({
  searchQuery,
  filters,
  organizationId,
  refreshTrigger = 0,
  onSetFilterOptions,
}: UseFormatTableProps) {
  const [sortField, setSortField] = useState<SortField>('format_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

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

      onSetFilterOptions({
        cover_stock_print: coverStockOptions,
        internal_stock_print: internalStockOptions,
      });
    }
  }, [formats, onSetFilterOptions]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load formats: " + (error as Error).message);
    }
  }, [error]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return {
    formats,
    isLoading,
    error,
    refetch,
    formatDate,
    sortField,
    sortDirection,
    handleSort
  };
}
