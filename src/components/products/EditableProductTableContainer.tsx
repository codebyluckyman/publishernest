
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useOrganization } from "@/context/OrganizationContext";
import ProductDialog from "@/components/ProductDialog";
import ProductViewDialog from "@/components/ProductViewDialog";
import { EditableProductTableHeader } from "./EditableProductTableHeader";
import ProductFilters, { FILTER_VALUES } from "./ProductFilters";
import EditableProductTable from "./EditableProductTable";
import { ProductEditProvider } from "@/context/ProductEditContext";

export function EditableProductTableContainer() {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    product_form: string | null;
    publisher_name: string | null;
    pub_month: string | null;
    license: string | null;
    format_id: string | null;
  }>({
    product_form: FILTER_VALUES.ALL_FORMATS,
    publisher_name: FILTER_VALUES.ALL_PUBLISHERS,
    pub_month: FILTER_VALUES.ALL_PUB_MONTHS,
    license: FILTER_VALUES.ALL_LICENSES,
    format_id: FILTER_VALUES.ALL_FORMAT_NAMES,
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
      filters.product_form !== null && filters.product_form !== FILTER_VALUES.ALL_FORMATS;
    const isPublisherNameActive =
      filters.publisher_name !== null && filters.publisher_name !== FILTER_VALUES.ALL_PUBLISHERS;
    const isPubMonthActive =
      filters.pub_month !== null && filters.pub_month !== FILTER_VALUES.ALL_PUB_MONTHS;
    const isLicenseActive =
      filters.license !== null && filters.license !== FILTER_VALUES.ALL_LICENSES;
    const isFormatActive =
      filters.format_id !== null && filters.format_id !== FILTER_VALUES.ALL_FORMAT_NAMES;
      
    return isProductFormActive || isPublisherNameActive || isPubMonthActive || 
           isLicenseActive || isFormatActive;
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (
      (key === "product_form" && value === FILTER_VALUES.ALL_FORMATS) ||
      (key === "publisher_name" && value === FILTER_VALUES.ALL_PUBLISHERS) ||
      (key === "pub_month" && value === FILTER_VALUES.ALL_PUB_MONTHS) ||
      (key === "license" && value === FILTER_VALUES.ALL_LICENSES) ||
      (key === "format_id" && value === FILTER_VALUES.ALL_FORMAT_NAMES)
    ) {
      return false;
    }

    return Boolean(value);
  }).length;

  return (
    <ProductEditProvider>
      <Card>
        <CardHeader>
          <EditableProductTableHeader
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
          <EditableProductTable
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
    </ProductEditProvider>
  );
}
