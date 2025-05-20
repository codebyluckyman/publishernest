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
    product_form: string | string[];
    publisher_name: string | string[];
    pub_month: string | string[] | null;
    license: string | string[] | null;
    format_id: string | string[] | null;
    series_name: string | string[] | null;
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
  
  // Handle product_form filter
  if (filters.product_form && filters.product_form !== "ALL_FORMATS") {
    if (Array.isArray(filters.product_form)) {
      // Remove the ALL_FORMATS value if present
      const validFormats = filters.product_form.filter(f => f !== "ALL_FORMATS");
      if (validFormats.length > 0) {
        queryBuilder = queryBuilder.in("product_form", validFormats);
      }
    } else {
      queryBuilder = queryBuilder.eq("product_form", filters.product_form);
    }
  }

  // Handle publisher_name filter
  if (filters.publisher_name && filters.publisher_name !== "ALL_PUBLISHERS") {
    if (Array.isArray(filters.publisher_name)) {
      // Remove the ALL_PUBLISHERS value if present
      const validPublishers = filters.publisher_name.filter(p => p !== "ALL_PUBLISHERS");
      if (validPublishers.length > 0) {
        queryBuilder = queryBuilder.in("publisher_name", validPublishers);
      }
    } else {
      queryBuilder = queryBuilder.eq("publisher_name", filters.publisher_name);
    }
  }
  
  // Handle license filter
  if (filters.license && filters.license !== "ALL_LICENSES") {
    if (Array.isArray(filters.license)) {
      // Remove the ALL_LICENSES value if present
      const validLicenses = filters.license.filter(l => l !== "ALL_LICENSES");
      if (validLicenses.length > 0) {
        queryBuilder = queryBuilder.in("license", validLicenses);
      }
    } else {
      queryBuilder = queryBuilder.eq("license", filters.license);
    }
  }
  
  // Handle format_id filter
  if (filters.format_id && filters.format_id !== "ALL_FORMAT_NAMES") {
    if (Array.isArray(filters.format_id)) {
      // Remove the ALL_FORMAT_NAMES value if present
      const validFormatIds = filters.format_id.filter(f => f !== "ALL_FORMAT_NAMES");
      if (validFormatIds.length > 0) {
        queryBuilder = queryBuilder.in("format_id", validFormatIds);
      }
    } else {
      queryBuilder = queryBuilder.eq("format_id", filters.format_id);
    }
  }
  
  // Handle series_name filter
  if (filters.series_name && filters.series_name !== "ALL_SERIES") {
    if (Array.isArray(filters.series_name)) {
      // Remove the ALL_SERIES value if present
      const validSeries = filters.series_name.filter(s => s !== "ALL_SERIES");
      if (validSeries.length > 0) {
        queryBuilder = queryBuilder.in("series_name", validSeries);
      }
    } else {
      queryBuilder = queryBuilder.eq("series_name", filters.series_name);
    }
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
    if (Array.isArray(filters.pub_month)) {
      // Remove the ALL_PUB_MONTHS value if present
      const validPubMonths = filters.pub_month.filter(pm => pm !== "ALL_PUB_MONTHS");
      
      if (validPubMonths.length > 0) {
        filteredProducts = productsData.filter(product => {
          if (!product.publication_date) return false;
          const date = new Date(product.publication_date);
          const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          return validPubMonths.includes(monthYear);
        });
      }
    } else {
      filteredProducts = productsData.filter(product => {
        if (!product.publication_date) return false;
        const date = new Date(product.publication_date);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return monthYear === filters.pub_month;
      });
    }
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
