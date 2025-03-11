
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

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ["products", currentOrganization?.id, searchQuery, filters, refreshTrigger, sortField, sortDirection],
    queryFn: fetchProducts,
    enabled: !!currentOrganization,
  });

  if (error) {
    toast.error("Failed to load products: " + (error as Error).message);
  }

  const copyProduct = async (productId: string): Promise<string> => {
    if (!currentOrganization) {
      toast.error("No organization selected");
      throw new Error("No organization selected");
    }

    try {
      const { data: productToCopy, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fetchError || !productToCopy) {
        throw new Error("Failed to fetch product to copy");
      }

      // Create a new object without id, created_at, and updated_at fields
      const newProductData = {
        organization_id: productToCopy.organization_id,
        title: `${productToCopy.title} (Copy)`,
        subtitle: productToCopy.subtitle,
        isbn13: null, // ISBN must be unique
        isbn10: null, // ISBN must be unique
        product_form: productToCopy.product_form,
        product_form_detail: productToCopy.product_form_detail,
        series_name: productToCopy.series_name,
        edition_number: productToCopy.edition_number,
        language_code: productToCopy.language_code,
        page_count: productToCopy.page_count,
        publisher_name: productToCopy.publisher_name,
        publication_date: productToCopy.publication_date,
        list_price: productToCopy.list_price,
        currency_code: productToCopy.currency_code,
        product_availability_code: productToCopy.product_availability_code,
        subject_code: productToCopy.subject_code,
        height_measurement: productToCopy.height_measurement,
        width_measurement: productToCopy.width_measurement,
        thickness_measurement: productToCopy.thickness_measurement,
        weight_measurement: productToCopy.weight_measurement,
        cover_image_url: productToCopy.cover_image_url,
        format_id: productToCopy.format_id,
        internal_images: productToCopy.internal_images,
        carton_quantity: productToCopy.carton_quantity,
        carton_length_mm: productToCopy.carton_length_mm,
        carton_width_mm: productToCopy.carton_width_mm,
        carton_height_mm: productToCopy.carton_height_mm,
        carton_weight_kg: productToCopy.carton_weight_kg,
        age_range: productToCopy.age_range,
        synopsis: productToCopy.synopsis,
        license: productToCopy.license
      };

      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert(newProductData)
        .select()
        .single();

      if (insertError || !newProduct) {
        console.error("Error creating new product:", insertError);
        throw new Error("Failed to create new product");
      }

      // Copy associated prices
      const { data: prices, error: pricesError } = await supabase
        .from("product_prices")
        .select("*")
        .eq("product_id", productId);

      if (!pricesError && prices && prices.length > 0) {
        const newPrices = prices.map(price => ({
          product_id: newProduct.id,
          organization_id: price.organization_id,
          price: price.price,
          currency_code: price.currency_code,
          is_default: price.is_default
        }));

        await supabase.from("product_prices").insert(newPrices);
      }

      refetch();

      toast.success("Product copied successfully");
      return newProduct.id;
    } catch (error) {
      console.error("Error copying product:", error);
      toast.error("Failed to copy product: " + (error as Error).message);
      throw error;
    }
  };

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
      handleCopyProduct={copyProduct}
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
