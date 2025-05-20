
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Organization } from "@/types/organization";
import { Product, SortDirection, SortField } from "@/types/product";

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

export const formatMonthYear = (dateString: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const formatPrice = (
  price: number | null,
  currencyCode: string | null = "USD"
) => {
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
    BA: "Book",
    BB: "Hardcover",
    BC: "Paperback",
    JB: "Journal",
    DG: "Electronic",
    XA: "Custom",
  };

  return formMap[form] || form;
};

export const fetchProducts = async (
  currentOrganization: Organization | null,
  searchQuery: string,
  filters: {
    product_form: string | null;
    publisher_name: string | null;
    pub_month: string | null;
    license: string | null;
    format_id: string | null;
  },
  sortField: SortField,
  sortDirection: SortDirection
) => {
  if (!currentOrganization) {
    return [];
  }

  let queryBuilder = supabase
    .from("products")
    .select(`
      *,
      format:format_id (
        id,
        format_name
      )
    `)
    .eq("organization_id", currentOrganization.id);

  if (searchQuery) {
    queryBuilder = queryBuilder.ilike("title", `%${searchQuery}%`);
  }
  
  if (filters.product_form && filters.product_form !== "ALL_FORMATS") {
    queryBuilder = queryBuilder.eq("product_form", filters.product_form);
  }

  if (filters.publisher_name && filters.publisher_name !== "ALL_PUBLISHERS") {
    queryBuilder = queryBuilder.eq("publisher_name", filters.publisher_name);
  }
  
  if (filters.license && filters.license !== "ALL_LICENSES") {
    queryBuilder = queryBuilder.eq("license", filters.license);
  }
  
  if (filters.format_id && filters.format_id !== "ALL_FORMAT_NAMES") {
    queryBuilder = queryBuilder.eq("format_id", filters.format_id);
  }

  // Get data based on the built query
  const { data: productsData, error } = await queryBuilder.order(sortField, {
    ascending: sortDirection === "asc",
  });
  
  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }
  
  // Handle pub_month filter separately since we need to filter client-side
  let filteredProducts = productsData;
  if (filters.pub_month && filters.pub_month !== "ALL_PUB_MONTHS" && productsData) {
    filteredProducts = productsData.filter(product => {
      if (!product.publication_date) return false;
      const date = new Date(product.publication_date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      return monthYear === filters.pub_month;
    });
  }

  if (filteredProducts && filteredProducts.length > 0) {
    const productIds = filteredProducts.map((product) => product.id);

    const { data: pricesData, error: pricesError } = await supabase
      .from("product_prices")
      .select("product_id, price, currency_code")
      .in("product_id", productIds)
      .eq("is_default", true);

    if (pricesError) {
      console.error("Error fetching product prices:", pricesError);
      return filteredProducts.map((product) => ({
        ...product,
        default_price: product.list_price,
        default_currency: "USD",
      }));
    }

    const priceMap: Record<string, { price: number; currency: string }> = {};

    if (pricesData) {
      pricesData.forEach((priceInfo) => {
        priceMap[priceInfo.product_id] = {
          price: priceInfo.price,
          currency: priceInfo.currency_code,
        };
      });
    }

    return filteredProducts.map((product) => ({
      ...product,
      default_price: priceMap[product.id]?.price ?? product.list_price,
      default_currency: priceMap[product.id]?.currency ?? "USD",
    }));
  }

  return filteredProducts ? filteredProducts.map((product) => ({
    ...product,
    default_price: product.list_price,
    default_currency: "USD",
  })) : [];
};
