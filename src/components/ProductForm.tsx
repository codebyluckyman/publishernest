
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useProductForm } from "@/hooks/useProductForm";
import { CoverImageSection } from "./products/form-sections/CoverImageSection";
import { BasicInfoSection } from "./products/form-sections/BasicInfoSection";
import { IdentifiersSection } from "./products/form-sections/IdentifiersSection";
import { FormatSection } from "./products/form-sections/FormatSection";
import { PublicationSection } from "./products/form-sections/PublicationSection";
import { PhysicalPropertiesSection } from "./products/form-sections/PhysicalPropertiesSection";
import { DescriptionSection } from "./products/form-sections/DescriptionSection";

type ProductFormProps = {
  productId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function ProductForm({ productId, onSuccess, onCancel }: ProductFormProps) {
  const { form, isLoading, isEditMode, onSubmit } = useProductForm(productId, onSuccess);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CoverImageSection form={form} />
        <BasicInfoSection form={form} />
        <IdentifiersSection form={form} />
        <FormatSection form={form} />
        <PublicationSection form={form} />
        <PhysicalPropertiesSection form={form} />
        <DescriptionSection form={form} />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} variant="default">
            {isLoading ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
