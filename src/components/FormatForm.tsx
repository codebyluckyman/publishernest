
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";

const formatSchema = z.object({
  format_name: z.string().min(1, "Format name is required"),
  tps: z.string().optional(),
  extent: z.string().optional(),
  cover_stock_print: z.string().optional(),
  internal_stock_print: z.string().optional(),
});

type FormatFormValues = z.infer<typeof formatSchema>;

type FormatFormProps = {
  formatId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

const defaultValues: FormatFormValues = {
  format_name: "",
  tps: "",
  extent: "",
  cover_stock_print: "",
  internal_stock_print: "",
};

export default function FormatForm({ formatId, onSuccess, onCancel }: FormatFormProps) {
  const { currentOrganization } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!formatId;

  const form = useForm<FormatFormValues>({
    resolver: zodResolver(formatSchema),
    defaultValues,
  });

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
              tps: data.tps || "",
              extent: data.extent || "",
              cover_stock_print: data.cover_stock_print || "",
              internal_stock_print: data.internal_stock_print || "",
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

  async function onSubmit(values: FormatFormValues) {
    if (!currentOrganization) {
      toast.error("No organization selected");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formattedValues = {
        ...values,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="format_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Paperback 6x9" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TPS (Total Pages)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 240 pages" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="extent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Extent</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 6x9 inches" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cover_stock_print"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Stock/Print</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 12pt C1S, 4-color process + matte lamination" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="internal_stock_print"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Stock/Print</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 60# white offset, 1-color black" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditMode ? "Update Format" : "Create Format"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
