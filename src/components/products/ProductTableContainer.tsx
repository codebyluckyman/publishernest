import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useOrganization } from "@/context/OrganizationContext";
import ProductDialog from "@/components/ProductDialog";
import ProductViewDialog from "@/components/ProductViewDialog";
import { ProductTableHeader } from "./ProductTableHeader";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";

export function ProductTableContainer() {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<
    string | undefined
  >(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    product_form: string | null;
    publisher_name: string | null;
  }>({
    product_form: null,
    publisher_name: null,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsViewDialogOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProductId(undefined);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // const areFiltersActive = () => {
  //   return filters.product_form !== null || filters.publisher_name !== null;
  // };

  const areFiltersActive = () => {
    const isProductFormActive =
      filters.product_form !== null && filters.product_form !== "ALL_FORMATS";
    const isPublisherNameActive =
      filters.publisher_name !== null &&
      filters.publisher_name !== "ALL_PUBLISHERS";
    return isProductFormActive || isPublisherNameActive;
  };

  // const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (
      (key === "product_form" && value === "ALL_FORMATS") ||
      (key === "publisher_name" && value === "ALL_PUBLISHERS")
    ) {
      return false;
    }

    return Boolean(value);
  }).length;

  return (
    <Card>
      <CardHeader>
        <ProductTableHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFilters={showFilters}
          toggleFilters={toggleFilters}
          onAddProduct={handleAddProduct}
          areFiltersActive={areFiltersActive}
          activeFiltersCount={activeFiltersCount}
        />

        <ProductFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />
      </CardHeader>
      <CardContent>
        <ProductTable
          searchQuery={searchQuery}
          filters={filters}
          currentOrganization={currentOrganization}
          onViewProduct={handleViewProduct}
          onEditProduct={handleEditProduct}
          onAddProduct={handleAddProduct}
          refreshTrigger={refreshTrigger}
        />
      </CardContent>

      <ProductDialog
        open={isDialogOpen}
        productId={selectedProductId}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      <ProductViewDialog
        open={isViewDialogOpen}
        productId={selectedProductId}
        onOpenChange={setIsViewDialogOpen}
      />
    </Card>
  );
}
