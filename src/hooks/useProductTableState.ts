
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SortDirection, SortField } from "@/types/product";
import { Organization } from "@/types/organization";
import { fetchProducts } from "@/utils/productUtils";
import { copyProduct } from "@/utils/productCopyUtils";
import { toast } from "sonner";

interface UseProductTableProps {
  searchQuery: string;
  filters: {
    product_form: string | null;
    publisher_name: string | null;
  };
  currentOrganization: Organization | null;
  refreshTrigger?: number;
}

export const useProductTableState = ({
  searchQuery,
  filters,
  currentOrganization,
  refreshTrigger = 0
}: UseProductTableProps) => {
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const { 
    data: products, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["products", currentOrganization?.id, searchQuery, filters, refreshTrigger, sortField, sortDirection],
    queryFn: () => fetchProducts(currentOrganization, searchQuery, filters, sortField, sortDirection),
    enabled: !!currentOrganization,
  });

  if (error) {
    toast.error("Failed to load products: " + (error as Error).message);
  }

  const handleCopyProduct = async (productId: string): Promise<string> => {
    const newProductId = await copyProduct(productId, currentOrganization);
    refetch();
    return newProductId;
  };

  return {
    products,
    isLoading,
    error,
    sortField,
    sortDirection,
    handleSort,
    handleCopyProduct,
    refetch
  };
};
