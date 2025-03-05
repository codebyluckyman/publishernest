
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
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formattedValues = {
        ...values,
        title: values.title,
        publication_date: values.publication_date ? values.publication_date.toISOString().split('T')[0] : null,
        organization_id: currentOrganization.id,
      };

      let result;
      
      if (isEditMode) {
        result = await supabase
          .from("products")
          .update(formattedValues)
          .eq("id", productId);
      } else {
        result = await supabase
          .from("products")
          .insert(formattedValues);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success(isEditMode ? "Product updated successfully" : "Product created successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to ${isEditMode ? "update" : "create"} product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
