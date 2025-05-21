
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useOrganization } from "@/context/OrganizationContext";
import ProductDialog from "@/components/ProductDialog";
import ProductViewDialog from "@/components/ProductViewDialog";
import { ProductTableHeader } from "./ProductTableHeader";
import ProductFilters, { FILTER_VALUES } from "./ProductFilters";
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
    product_form: string | string[];
    publisher_name: string | string[];
    pub_month: string | string[] | null;
    license: string | string[] | null;
    format_id: string | string[] | null;
    series_name: string | string[] | null;
  }>({
    product_form: FILTER_VALUES.ALL_FORMATS,
    publisher_name: FILTER_VALUES.ALL_PUBLISHERS,
    pub_month: FILTER_VALUES.ALL_PUB_MONTHS,
    license: FILTER_VALUES.ALL_LICENSES,
    format_id: FILTER_VALUES.ALL_FORMAT_NAMES,
    series_name: FILTER_VALUES.ALL_SERIES,
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

  const areFiltersActive = () => {
    const isProductFormActive =
      filters.product_form !== FILTER_VALUES.ALL_FORMATS;
    const isPublisherNameActive =
      filters.publisher_name !== FILTER_VALUES.ALL_PUBLISHERS;
    const isPubMonthActive =
      filters.pub_month !== FILTER_VALUES.ALL_PUB_MONTHS;
    const isLicenseActive =
      filters.license !== FILTER_VALUES.ALL_LICENSES;
    const isFormatActive =
      filters.format_id !== FILTER_VALUES.ALL_FORMAT_NAMES;
    const isSeriesActive = 
      filters.series_name !== FILTER_VALUES.ALL_SERIES;
      
    return isProductFormActive || isPublisherNameActive || isPubMonthActive || 
           isLicenseActive || isFormatActive || isSeriesActive;
  };
  
  const countActiveFilters = () => {
    let count = 0;
    
    // Helper function to check if filter is active
    const isFilterActive = (filter: string | string[] | null, defaultValue: string) => {
      if (Array.isArray(filter)) {
        return filter.length > 0 && (filter.length !== 1 || filter[0] !== defaultValue);
      }
      return filter !== defaultValue;
    };
    
    if (isFilterActive(filters.product_form, FILTER_VALUES.ALL_FORMATS)) count++;
    if (isFilterActive(filters.publisher_name, FILTER_VALUES.ALL_PUBLISHERS)) count++;
    if (isFilterActive(filters.pub_month, FILTER_VALUES.ALL_PUB_MONTHS)) count++;
    if (isFilterActive(filters.license, FILTER_VALUES.ALL_LICENSES)) count++;
    if (isFilterActive(filters.format_id, FILTER_VALUES.ALL_FORMAT_NAMES)) count++;
    if (isFilterActive(filters.series_name, FILTER_VALUES.ALL_SERIES)) count++;
    
    return count;
  };

  const activeFiltersCount = countActiveFilters();

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
