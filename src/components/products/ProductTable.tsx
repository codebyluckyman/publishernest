import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import ProductTableContent from "./ProductTableContent";
import { ProductEmptyState } from "./ProductEmptyState";

export interface Product {
  id: string;
  title: string;
  isbn13: string | null;
  isbn10: string | null;
  product_form: string | null;
  publisher_name: string | null;
  publication_date: string | null;
  list_price: number | null;
  default_price: number | null;
  default_currency: string | null;
  created_at: string;
  updated_at: string;
  cover_image_url: string | null;
}

interface ProductTableProps {
  searchQuery: string;
  filters: {
    product_form: string | null;
    publisher_name: string | null;
  };
  currentOrganization: Organization | null;
  onViewProduct: (productId: string) => void;
  onEditProduct: (productId: string) => void;
  onAddProduct: () => void;
  refreshTrigger?: number;
}

export type SortField = 'title' | 'publication_date' | 'publisher_name' | 'list_price';
export type SortDirection = 'asc' | 'desc';

const ProductTable = ({
  searchQuery,
  filters,
  currentOrganization,
  onViewProduct,
  onEditProduct,
  onAddProduct,
  refreshTrigger = 0
}: ProductTableProps) => {
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

  const fetchProducts = async () => {
    if (!currentOrganization) {
      return [];
    }

    let queryBuilder = supabase
      .from("products")
      .select("*")
      .eq("organization_id", currentOrganization.id);

    if (searchQuery) {
      queryBuilder = queryBuilder.ilike("title", `%${searchQuery}%`);
    }

    if (filters.product_form) {
      queryBuilder = queryBuilder.eq("product_form", filters.product_form);
    }

    if (filters.publisher_name) {
      queryBuilder = queryBuilder.eq("publisher_name", filters.publisher_name);
    }

    const { data: productsData, error } = await queryBuilder.order(sortField, { ascending: sortDirection === 'asc' });

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error(error.message);
    }

    if (productsData && productsData.length > 0) {
      const productIds = productsData.map(product => product.id);
      
      const { data: pricesData, error: pricesError } = await supabase
        .from("product_prices")
        .select("product_id, price, currency_code")
        .in("product_id", productIds)
        .eq("is_default", true);

      if (pricesError) {
        console.error("Error fetching product prices:", pricesError);
        return productsData.map(product => ({
          ...product,
          default_price: product.list_price,
          default_currency: "USD"
        })) as unknown as Product[];
      }

      const priceMap: Record<string, { price: number; currency: string }> = {};
      
      if (pricesData) {
        pricesData.forEach(priceInfo => {
          priceMap[priceInfo.product_id] = {
            price: priceInfo.price,
            currency: priceInfo.currency_code
          };
        });
      }

      return productsData.map(product => ({
        ...product,
        default_price: priceMap[product.id]?.price ?? product.list_price,
        default_currency: priceMap[product.id]?.currency ?? "USD"
      })) as unknown as Product[];
    }

    return productsData ? productsData.map(product => ({
      ...product,
      default_price: product.list_price,
      default_currency: "USD"
    })) as unknown as Product[] : [];
  };

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", currentOrganization?.id, searchQuery, filters, refreshTrigger, sortField, sortDirection],
    queryFn: fetchProducts,
    enabled: !!currentOrganization,
  });

  if (error) {
    toast.error("Failed to load products: " + (error as Error).message);
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price: number | null, currencyCode: string | null = "USD") => {
    if (price === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
    }).format(price);
  };

  const getProductFormLabel = (form: string | null) => {
    if (!form) return "N/A";
    
    const formMap: Record<string, string> = {
      "BA": "Book",
      "BB": "Hardcover",
      "BC": "Paperback",
      "JB": "Journal",
      "DG": "Electronic",
      "XA": "Custom",
    };
    
    return formMap[form] || form;
  };

  if (isLoading) {
    return null;
  }

  if (!products || products.length === 0) {
    return <ProductEmptyState hasOrganization={!!currentOrganization} onAddProduct={onAddProduct} />;
  }

  return (
    <ProductTableContent 
      products={products}
      isLoading={isLoading}
      currentOrganization={currentOrganization}
      handleViewProduct={onViewProduct}
      handleEditProduct={onEditProduct}
      handleAddProduct={onAddProduct}
      formatDate={formatDate}
      formatPrice={formatPrice}
      getProductFormLabel={getProductFormLabel}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={handleSort}
    />
  );
};

export default ProductTable;
