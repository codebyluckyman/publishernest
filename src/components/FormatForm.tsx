import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useOrganization } from "@/hooks/useOrganization";
import { useFormats } from "@/hooks/useFormats";
import { FormatFormFields } from "./form/FormatFormFields";
import { toast } from "sonner";

const formatSchema = z.object({
  format_name: z.string().min(1, "Format name is required"),
  tps_height_mm: z.number().nullable(),
  tps_width_mm: z.number().nullable(),
  tps_depth_mm: z.number().nullable(),
  tps_plc_height_mm: z.number().nullable(),
  tps_plc_width_mm: z.number().nullable(),
  tps_plc_depth_mm: z.number().nullable(),
  extent: z.string().nullable(),
  cover_stock_print: z.string().nullable(),
  internal_stock_print: z.string().nullable(),
  binding_type: z.string().nullable(),
  cover_material: z.string().nullable(),
  internal_material: z.string().nullable(),
  orientation: z.string().nullable(),
  end_papers_material: z.string().nullable(),
  end_papers_print: z.string().nullable(),
  spacers_material: z.string().nullable(),
  spacers_stock_print: z.string().nullable(),
});

type FormatFormData = z.infer<typeof formatSchema>;

interface FormatFormProps {
  format?: any;
  initialValues?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FormatForm({ format, initialValues, onSuccess, onCancel }: FormatFormProps) {
  const { currentOrganization } = useOrganization();
  const { useCreateFormat, useUpdateFormat } = useFormats();
  
  const createFormatMutation = useCreateFormat();
  const updateFormatMutation = useUpdateFormat();

  const form = useForm<FormatFormData>({
    resolver: zodResolver(formatSchema),
    defaultValues: {
      format_name: "",
      tps_height_mm: null,
      tps_width_mm: null,
      tps_depth_mm: null,
      tps_plc_height_mm: null,
      tps_plc_width_mm: null,
      tps_plc_depth_mm: null,
      extent: null,
      cover_stock_print: null,
      internal_stock_print: null,
      binding_type: null,
      cover_material: null,
      internal_material: null,
      orientation: null,
      end_papers_material: null,
      end_papers_print: null,
      spacers_material: null,
      spacers_stock_print: null,
    }
  });

  // Handle initial values and format data
  useEffect(() => {
    if (initialValues) {
      // AI-generated initial values
      console.log('Setting AI-generated initial values:', initialValues);
      Object.keys(initialValues).forEach(key => {
        if (key in form.getValues()) {
          form.setValue(key as keyof FormatFormData, initialValues[key]);
        }
      });
    } else if (format) {
      // Existing format data for editing
      Object.keys(format).forEach(key => {
        if (key in form.getValues()) {
          form.setValue(key as keyof FormatFormData, format[key]);
        }
      });
    }
  }, [format, initialValues, form]);

  const onSubmit = async (data: FormatFormData) => {
    if (!currentOrganization) {
      toast.error("No organization selected");
      return;
    }

    try {
      if (format?.id) {
        await updateFormatMutation.mutateAsync({
          id: format.id,
          data: { ...data, organization_id: currentOrganization.id }
        });
        toast.success("Format updated successfully");
      } else {
        await createFormatMutation.mutateAsync({
          ...data,
          organization_id: currentOrganization.id
        });
        toast.success("Format created successfully");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving format:", error);
      toast.error("Failed to save format");
    }
  };

  const isSubmitting = createFormatMutation.isPending || updateFormatMutation.isPending;
  const isEditing = !!format?.id;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormatFormFields form={form} />
        
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Format" : "Create Format"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
