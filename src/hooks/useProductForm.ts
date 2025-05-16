import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { productSchema, defaultProductValues, ProductFormValues } from "@/schemas/productSchema";

export function useProductForm(productId: string | undefined, onSuccess: () => void) {
  const { currentOrganization } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!productId;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultProductValues,
  });

  useEffect(() => {
    if (isEditMode && productId) {
      setIsLoading(true);
      
      const fetchProduct = async () => {
        try {
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .single();
            
          if (error) {
            toast.error("Failed to load product: " + error.message);
            return;
          }
          
          if (data) {
            const publicationDate = data.publication_date 
              ? new Date(data.publication_date) 
              : null;
              
            // Parse format_extras from JSON if it exists, otherwise use default
            const formatExtras = data.format_extras 
              ? (typeof data.format_extras === 'string' 
                  ? JSON.parse(data.format_extras) 
                  : data.format_extras)
              : defaultProductValues.format_extras;
              
            // Parse selling_points from JSON if it exists, otherwise use default
            const sellingPoints = data.selling_points
              ? (typeof data.selling_points === 'string'
                  ? JSON.parse(data.selling_points)
                  : data.selling_points)
              : defaultProductValues.selling_points;
              
            form.reset({
              ...data,
              publication_date: publicationDate,
              list_price: data.list_price !== null ? Number(data.list_price) : null,
              page_count: data.page_count !== null ? Number(data.page_count) : null,
              edition_number: data.edition_number !== null ? Number(data.edition_number) : null,
              height_measurement: data.height_measurement !== null ? Number(data.height_measurement) : null,
              width_measurement: data.width_measurement !== null ? Number(data.width_measurement) : null,
              thickness_measurement: data.thickness_measurement !== null ? Number(data.thickness_measurement) : null,
              weight_measurement: data.weight_measurement !== null ? Number(data.weight_measurement) : null,
              format_id: data.format_id || null,
              // New fields
              internal_images: data.internal_images || [],
              carton_quantity: data.carton_quantity !== null ? Number(data.carton_quantity) : null,
              carton_length_mm: data.carton_length_mm !== null ? Number(data.carton_length_mm) : null,
              carton_width_mm: data.carton_width_mm !== null ? Number(data.carton_width_mm) : null,
              carton_height_mm: data.carton_height_mm !== null ? Number(data.carton_height_mm) : null,
              carton_weight_kg: data.carton_weight_kg !== null ? Number(data.carton_weight_kg) : null,
              age_range: data.age_range || "",
              synopsis: data.synopsis || "",
              license: data.license || "",
              format_extras: formatExtras,
              format_extra_comments: data.format_extra_comments || null,
              selling_points: sellingPoints || [],
            });
          }
        } catch (err: any) {
          toast.error("Error loading product: " + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchProduct();
    }
  }, [isEditMode, productId, form]);

  async function onSubmit(values: ProductFormValues) {
    if (!currentOrganization) {
      toast.error("No organization selected");
      return { success: false, productId: null };
    }
    
    setIsLoading(true);
    
    try {
      // Clean up the format_id field - if it's an empty string, set it to null
      const cleanedFormatId = values.format_id === "" ? null : values.format_id;
      
      const formattedValues = {
        ...values,
        title: values.title,
        publication_date: values.publication_date ? formatDateToYYYYMMDD(values.publication_date) : null,
        organization_id: currentOrganization.id,
        format_id: cleanedFormatId, // Use the cleaned format_id
      };

      console.log("Submitting product with values:", formattedValues);
      
      let result;
      let submittedProductId = isEditMode ? productId : null;
      
      if (isEditMode) {
        result = await supabase
          .from("products")
          .update(formattedValues)
          .eq("id", productId);
      } else {
        result = await supabase
          .from("products")
          .insert(formattedValues)
          .select();
          
        if (result.data && result.data.length > 0) {
          submittedProductId = result.data[0].id;
        }
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success(isEditMode ? "Product updated successfully" : "Product created successfully");
      onSuccess();
      
      return { success: true, productId: submittedProductId };
    } catch (error: any) {
      toast.error(`Failed to ${isEditMode ? "update" : "create"} product: ${error.message}`);
      return { success: false, productId: null };
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Helper function to format a Date to YYYY-MM-DD string
   * without timezone conversion issues
   */
  function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    // getMonth() is 0-indexed, so add 1
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Handle product deletion
  async function deleteProduct() {
    if (!productId || !currentOrganization) {
      toast.error("Cannot delete product: Missing ID or organization");
      return;
    }
    
    setIsLoading(true);
    console.log("Delete Product function called with productId:", productId);
    
    try {
      // First delete associated stock records
      const { error: stockError } = await supabase
        .from("stock_on_hand")
        .delete()
        .eq("product_id", productId);
        
      if (stockError) {
        console.error("Error deleting stock records:", stockError);
      }
      
      // Then delete the product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
        
      if (error) {
        console.error("Error deleting product:", error);
        throw error;
      }
      
      toast.success("Product deleted successfully");
      onSuccess();
    } catch (error: any) {
      console.error("Exception when deleting product:", error);
      toast.error(`Failed to delete product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form,
    isLoading,
    isEditMode,
    onSubmit,
    deleteProduct
  };
}
