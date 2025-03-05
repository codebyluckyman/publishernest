
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import ProductDialog from "@/components/ProductDialog";
import ProductViewDialog from "@/components/ProductViewDialog";
import ProductTableHeader from "./ProductTableHeader";
import ProductTableContent from "./ProductTableContent";

interface Product {
  id: string;
  title: string;
  isbn13: string | null;
  isbn10: string | null;
  product_form: string | null;
  publisher_name: string | null;
  publication_date: string | null;
  list_price: number | null;
  created_at: string;
  updated_at: string;
  cover_image_url: string | null;
}

const ProductsTable = () => {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);

  const fetchProducts = async () => {
    if (!currentOrganization) {
      return [];
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("organization_id", currentOrganization.id);

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error(error.message);
    }

    return data as Product[];
  };

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ["products", currentOrganization?.id, searchQuery],
    queryFn: fetchProducts,
    enabled: !!currentOrganization,
  });

  // Handle error from React Query
  if (error) {
    toast.error("Failed to load products: " + (error as Error).message);
  }

  const handleAddProduct = () => {
    setSelectedProductId(undefined);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsDialogOpen(true);
  };

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsViewDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    refetch();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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

  return (
    <Card>
      <CardHeader>
        <ProductTableHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleAddProduct={handleAddProduct}
        />
      </CardHeader>
      <CardContent>
        <ProductTableContent 
          products={products}
          isLoading={isLoading}
          currentOrganization={currentOrganization}
          handleViewProduct={handleViewProduct}
          handleEditProduct={handleEditProduct}
          handleAddProduct={handleAddProduct}
          formatDate={formatDate}
          formatPrice={formatPrice}
          getProductFormLabel={getProductFormLabel}
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
};

export default ProductsTable;
