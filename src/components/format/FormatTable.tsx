
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Format, FormatTableRow } from "./FormatTableRow";
import { FormatEmptyState } from "./FormatEmptyState";
import { FilterOptions } from "./FormatFilters";

interface FormatTableProps {
  searchQuery: string;
  filters: FilterOptions;
  organizationId: string | undefined;
  onViewFormat: (formatId: string) => void;
  onEditFormat: (formatId: string) => void;
  onAddFormat: () => void;
  setFilterOptions: React.Dispatch<React.SetStateAction<{
    tps: string[];
    cover_stock_print: string[];
    internal_stock_print: string[];
  }>>;
}

export function FormatTable({
  searchQuery,
  filters,
  organizationId,
  onViewFormat,
  onEditFormat,
  onAddFormat,
  setFilterOptions
}: FormatTableProps) {
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

    if (filters.tps) {
      query = query.eq("tps", filters.tps);
    }
    if (filters.cover_stock_print) {
      query = query.eq("cover_stock_print", filters.cover_stock_print);
    }
    if (filters.internal_stock_print) {
      query = query.eq("internal_stock_print", filters.internal_stock_print);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching formats:", error);
      throw new Error(error.message);
    }

    return data as Format[];
  };

  const { data: formats, isLoading, error, refetch } = useQuery({
    queryKey: ["formats", organizationId, searchQuery, filters],
    queryFn: fetchFormats,
    enabled: !!organizationId,
  });

  useEffect(() => {
    if (formats && formats.length > 0) {
      const tpsOptions = Array.from(
        new Set(formats.map((format) => format.tps).filter(Boolean))
      ) as string[];
      
      const coverStockOptions = Array.from(
        new Set(formats.map((format) => format.cover_stock_print).filter(Boolean))
      ) as string[];
      
      const internalStockOptions = Array.from(
        new Set(formats.map((format) => format.internal_stock_print).filter(Boolean))
      ) as string[];

      setFilterOptions({
        tps: tpsOptions,
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
            <TableHead>Format Name</TableHead>
            <TableHead>TPS</TableHead>
            <TableHead>Extent</TableHead>
            <TableHead>Cover Stock/Print</TableHead>
            <TableHead>Internal Stock/Print</TableHead>
            <TableHead>Created</TableHead>
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
