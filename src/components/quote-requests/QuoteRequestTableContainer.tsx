
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Organization } from "@/types/organization";
import { QuoteRequestTableHeader } from "./QuoteRequestTableHeader";
import { QuoteRequestsTable } from "./QuoteRequestsTable";
import { QuoteRequestEmptyState } from "./QuoteRequestEmptyState";
import { QuoteRequestDialog } from "./QuoteRequestDialog";
import { QuoteRequestFilters } from "./QuoteRequestFilters";
import { useQuoteRequestsApi } from "@/hooks/useQuoteRequestsApi";
import { SortQuoteRequestField, SortDirection } from "@/types/quoteRequest";
import { Skeleton } from "@/components/ui/skeleton";

interface QuoteRequestTableContainerProps {
  currentOrganization: Organization | null;
}

export function QuoteRequestTableContainer({
  currentOrganization
}: QuoteRequestTableContainerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortQuoteRequestField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState({
    status: null,
    dueDate: null,
  });
  const [filterOptions, setFilterOptions] = useState({
    status: [],
  });
  
  const {
    quoteRequests,
    isLoading,
    error,
    refetch
  } = useQuoteRequestsApi(currentOrganization, {
    searchQuery,
    filters,
    sortField,
    sortDirection,
    refreshTrigger
  });

  const handleAddQuoteRequest = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Trigger a refresh when dialog closes
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSort = (field: SortQuoteRequestField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const resetFilters = () => {
    setFilters({
      status: null,
      dueDate: null,
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const areFiltersActive = () => {
    return filters.status !== null || filters.dueDate !== null;
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  useEffect(() => {
    if (quoteRequests && quoteRequests.length > 0) {
      const statusOptions = Array.from(
        new Set(quoteRequests.map((req) => req.status).filter(Boolean))
      );

      setFilterOptions({
        status: statusOptions as string[],
      });
    }
  }, [quoteRequests]);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading quote requests: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <QuoteRequestTableHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFilters={showFilters}
          toggleFilters={toggleFilters}
          onAddQuoteRequest={handleAddQuoteRequest}
          areFiltersActive={areFiltersActive}
          activeFiltersCount={activeFiltersCount}
          currentOrganization={currentOrganization}
          isLoading={isLoading}
          handleRefresh={handleRefresh}
        />

        {showFilters && (
          <QuoteRequestFilters
            filters={filters}
            setFilters={setFilters}
            filterOptions={filterOptions}
            resetFilters={resetFilters}
          />
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : !quoteRequests || quoteRequests.length === 0 ? (
          <QuoteRequestEmptyState 
            onAddQuoteRequest={handleAddQuoteRequest} 
            currentOrganization={currentOrganization}
          />
        ) : (
          <QuoteRequestsTable
            quoteRequests={quoteRequests}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            currentOrganization={currentOrganization}
          />
        )}
      </CardContent>

      <QuoteRequestDialog
        quoteRequest={null}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        currentOrganization={currentOrganization}
      />
    </Card>
  );
}
