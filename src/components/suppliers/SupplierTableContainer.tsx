
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useOrganization } from "@/context/OrganizationContext";
import { SupplierTableHeader } from "./SupplierTableHeader";
import { SupplierFilters } from "./SupplierFilters";
import { SupplierTable } from "./SupplierTable";
import { SupplierDialog } from "./SupplierDialog";

export function SupplierTableContainer() {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    status: string | null;
  }>({
    status: null,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddSupplier = () => {
    setSelectedSupplierId(undefined);
    setIsDialogOpen(true);
  };

  const handleEditSupplier = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const areFiltersActive = () => {
    return filters.status !== null;
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <SupplierTableHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFilters={showFilters}
          toggleFilters={toggleFilters}
          onAddSupplier={handleAddSupplier}
          areFiltersActive={areFiltersActive}
          activeFiltersCount={activeFiltersCount}
        />

        <SupplierFilters
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
        />
      </CardHeader>
      <CardContent>
        <SupplierTable
          searchQuery={searchQuery}
          filters={filters}
          organizationId={currentOrganization?.id}
          onEditSupplier={handleEditSupplier}
          onAddSupplier={handleAddSupplier}
          refreshTrigger={refreshTrigger}
        />
      </CardContent>

      <SupplierDialog
        open={isDialogOpen}
        supplierId={selectedSupplierId}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </Card>
  );
}
