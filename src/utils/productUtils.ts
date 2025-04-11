
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Organization } from "@/types/organization";
import { Product, SortDirection, SortField } from "@/types/product";

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

export const formatPrice = (price: number | null, currencyCode: string | null = "USD") => {
  if (price === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode || "USD",
  }).format(price);
};

export const formatNumber = (num: number | null) => {
  if (num === null) return "N/A";
  return num.toLocaleString("en-US");
};

export const getProductFormLabel = (form: string | null) => {
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

export const fetchProducts = async (
  currentOrganization: Organization | null,
  searchQuery: string,
  filters: {
    product_form: string | null;
    publisher_name: string | null;
  },
  sortField: SortField,
  sortDirection: SortDirection
) => {
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
