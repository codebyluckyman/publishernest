
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useOrganization } from "@/context/OrganizationContext";
import FormatDialog from "@/components/FormatDialog";
import FormatViewDialog from "@/components/FormatViewDialog";
import { FormatTableHeader } from "./FormatTableHeader";
import { FormatFilters, FilterOptions } from "./FormatFilters";
import { FormatTable } from "./FormatTable";

export function FormatTableContainer() {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedFormatId, setSelectedFormatId] = useState<string | undefined>(undefined);
  const [viewFormatId, setViewFormatId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    tps: null,
    cover_stock_print: null,
    internal_stock_print: null,
  });
  const [filterOptions, setFilterOptions] = useState<{
    tps: string[];
    cover_stock_print: string[];
    internal_stock_print: string[];
  }>({
    tps: [],
    cover_stock_print: [],
    internal_stock_print: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleViewFormat = (formatId: string) => {
    setViewFormatId(formatId);
    setIsViewDialogOpen(true);
  };

  const handleAddFormat = () => {
    setSelectedFormatId(undefined);
    setIsDialogOpen(true);
  };

  const handleEditFormat = (formatId: string) => {
    setSelectedFormatId(formatId);
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    // Trigger a refetch in the FormatTable component
    setSearchQuery(searchQuery);
  };

  const resetFilters = () => {
    setFilters({
      tps: null,
      cover_stock_print: null,
      internal_stock_print: null,
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const areFiltersActive = () => {
    return filters.tps !== null || 
           filters.cover_stock_print !== null || 
           filters.internal_stock_print !== null;
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <FormatTableHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFilters={showFilters}
          toggleFilters={toggleFilters}
          onAddFormat={handleAddFormat}
          areFiltersActive={areFiltersActive}
          activeFiltersCount={activeFiltersCount}
        />

        <FormatFilters
          filters={filters}
          setFilters={setFilters}
          filterOptions={filterOptions}
          showFilters={showFilters}
          resetFilters={resetFilters}
        />
      </CardHeader>
      <CardContent>
        <FormatTable
          searchQuery={searchQuery}
          filters={filters}
          organizationId={currentOrganization?.id}
          onViewFormat={handleViewFormat}
          onEditFormat={handleEditFormat}
          onAddFormat={handleAddFormat}
          setFilterOptions={setFilterOptions}
        />
      </CardContent>

      <FormatDialog
        open={isDialogOpen}
        formatId={selectedFormatId}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      <FormatViewDialog
        open={isViewDialogOpen}
        formatId={viewFormatId}
        onOpenChange={setIsViewDialogOpen}
      />
    </Card>
  );
}
