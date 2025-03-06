
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";

export const formatSchema = z.object({
  format_name: z.string().min(1, "Format name is required"),
  orientation: z.string().optional(),
  tps: z.string().optional(),
  tps_case: z.string().optional(),
  extent: z.string().optional(),
  cover_stock_print: z.string().optional(),
  internal_stock_print: z.string().optional(),
  cover_material: z.string().optional(),
  internal_material: z.string().optional(),
  binding_type: z.string().optional(),
});

export type FormatFormValues = z.infer<typeof formatSchema>;

export const defaultValues: FormatFormValues = {
  format_name: "",
  orientation: "",
  tps: "",
  tps_case: "",
  extent: "",
  cover_stock_print: "",
  internal_stock_print: "",
  cover_material: "",
  internal_material: "",
  binding_type: "",
};

interface UseFormatFormProps {
  formatId?: string;
  onSuccess: () => void;
}

export function useFormatForm({ formatId, onSuccess }: UseFormatFormProps) {
  const { currentOrganization } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!formatId;

  const form = useForm<FormatFormValues>({
    resolver: zodResolver(formatSchema),
    defaultValues,
  });

  // Fetch format data if in edit mode
  useEffect(() => {
    if (isEditMode && formatId) {
      setIsLoading(true);
      
      const fetchFormat = async () => {
        try {
          const { data, error } = await supabase
            .from("formats")
            .select("*")
            .eq("id", formatId)
            .single();
            
          if (error) {
            toast.error("Failed to load format: " + error.message);
            return;
          }
          
          if (data) {
            form.reset({
              format_name: data.format_name || "",
              orientation: data.orientation || "",
              tps: data.tps || "",
              tps_case: data.tps_case || "",
              extent: data.extent || "",
              cover_stock_print: data.cover_stock_print || "",
              internal_stock_print: data.internal_stock_print || "",
              cover_material: data.cover_material || "",
              internal_material: data.internal_material || "",
              binding_type: data.binding_type || "",
            });
          }
        } catch (err: any) {
          toast.error("Error loading format: " + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchFormat();
    }
  }, [isEditMode, formatId, form]);

  // Handle form submission
  async function onSubmit(values: FormatFormValues) {
    if (!currentOrganization) {
      toast.error("No organization selected");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Ensure format_name is properly set and not optional in our object
      if (!values.format_name) {
        throw new Error("Format name is required");
      }

      const formattedValues = {
        format_name: values.format_name,
        orientation: values.orientation,
        tps: values.tps,
        tps_case: values.tps_case,
        extent: values.extent,
        cover_stock_print: values.cover_stock_print,
        internal_stock_print: values.internal_stock_print,
        cover_material: values.cover_material,
        internal_material: values.internal_material,
        binding_type: values.binding_type,
        organization_id: currentOrganization.id,
      };

      let result;
      
      if (isEditMode) {
        result = await supabase
          .from("formats")
          .update(formattedValues)
          .eq("id", formatId);
      } else {
        result = await supabase
          .from("formats")
          .insert(formattedValues);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success(isEditMode ? "Format updated successfully" : "Format created successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to ${isEditMode ? "update" : "create"} format: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle format deletion
  async function deleteFormat() {
    if (!formatId || !currentOrganization) {
      toast.error("Cannot delete format: Missing ID or organization");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("formats")
        .delete()
        .eq("id", formatId);
        
      if (error) {
        throw error;
      }
      
      toast.success("Format deleted successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to delete format: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form,
    isLoading,
    isEditMode,
    onSubmit,
    deleteFormat
  };
}
