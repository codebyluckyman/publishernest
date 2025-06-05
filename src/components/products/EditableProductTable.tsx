import React, { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useOrganization } from "@/context/OrganizationContext";
import { supabase } from "@/integrations/supabase/client";
import { EditableProductTableHeader } from "./EditableProductTableHeader";
import { EditableProductTableContent } from "./EditableProductTableContent";
import { ProductWithMinimalFormat } from "./types/ProductTypes";

export function EditableProductTable() {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["editable-products", currentOrganization?.id, searchQuery, selectedFormatId],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from("products")
        .select(`
          *,
          format:formats (
            id,
            format_name
          )
        `)
        .eq("organization_id", currentOrganization.id);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,isbn13.ilike.%${searchQuery}%,isbn10.ilike.%${searchQuery}%`);
      }

      if (selectedFormatId) {
        query = query.eq("format_id", selectedFormatId);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Transform the data to ensure consistent format structure
      return data.map(product => ({
        ...product,
        default_price: product.list_price || 0,
        default_currency: product.currency_code || 'USD',
        age_range: product.age_range || '',
        carton_height_mm: product.carton_height_mm || 0,
        carton_length_mm: product.carton_length_mm || 0,
        carton_quantity: product.carton_quantity || 0,
        carton_weight_kg: product.carton_weight_kg || 0,
        carton_width_mm: product.carton_width_mm || 0,
        cover_image_url: product.cover_image_url || '',
        currency_code: product.currency_code || 'USD',
        edition_number: product.edition_number || 0,
        format_extra_comments: product.format_extra_comments || '',
        format_extras: product.format_extras || {},
        height_measurement: product.height_measurement || 0,
        internal_images: product.internal_images || [],
        isbn10: product.isbn10 || '',
        isbn13: product.isbn13 || '',
        language_code: product.language_code || '',
        license: product.license || '',
        list_price: product.list_price || 0,
        page_count: product.page_count || 0,
        product_availability_code: product.product_availability_code || '',
        product_form: product.product_form || '',
        product_form_detail: product.product_form_detail || '',
        publication_date: product.publication_date || null,
        publisher_name: product.publisher_name || '',
        selling_points: product.selling_points || '',
        series_name: product.series_name || '',
        status: product.status || 'active',
        subject_code: product.subject_code || '',
        subtitle: product.subtitle || '',
        synopsis: product.synopsis || '',
        thickness_measurement: product.thickness_measurement || 0,
        title: product.title || '',
        weight_measurement: product.weight_measurement || 0,
        width_measurement: product.width_measurement || 0,
        format: product.format ? {
          id: product.format.id,
          format_name: product.format.format_name
        } : null
      }));
    },
    enabled: !!currentOrganization?.id,
  });

  const { data: formats = [] } = useQuery({
    queryKey: ["formats-for-filter", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from("formats")
        .select("id, format_name")
        .eq("organization_id", currentOrganization.id)
        .order("format_name");

      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id,
  });

  const filteredProducts = useMemo(() => {
    return products as ProductWithMinimalFormat[];
  }, [products]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleFormatFilter = useCallback((formatId: string | null) => {
    setSelectedFormatId(formatId);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Error loading products: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <EditableProductTableHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          selectedFormatId={selectedFormatId}
          onFormatChange={handleFormatFilter}
          formats={formats}
          totalProducts={filteredProducts.length}
        />
      </CardHeader>
      <CardContent>
        <EditableProductTableContent
          products={paginatedProducts}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </CardContent>
    </Card>
  );
}
