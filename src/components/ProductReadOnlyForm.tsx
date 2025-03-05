
import { Form } from "@/components/ui/form";
import { useProductForm } from "@/hooks/useProductForm";
import { CoverImageSection } from "./products/form-sections/CoverImageSection";
import { BasicInfoSection } from "./products/form-sections/BasicInfoSection";
import { IdentifiersSection } from "./products/form-sections/IdentifiersSection";
import { FormatSection } from "./products/form-sections/FormatSection";
import { PublicationSection } from "./products/form-sections/PublicationSection";
import { PhysicalPropertiesSection } from "./products/form-sections/PhysicalPropertiesSection";
import { DescriptionSection } from "./products/form-sections/DescriptionSection";

type ProductReadOnlyFormProps = {
  productId: string;
};

export default function ProductReadOnlyForm({ productId }: ProductReadOnlyFormProps) {
  const { form, isLoading } = useProductForm(productId, () => {});

  // Set all fields to readOnly
  const allFields = form.getValues();
  Object.keys(allFields).forEach(fieldName => {
    form.getFieldState(fieldName as any);
    const field = form.getValues(fieldName as any);
    if (field !== undefined) {
      form.register(fieldName as any, { disabled: true });
    }
  });

  return (
    <Form {...form}>
      <div className="space-y-6">
        <CoverImageSection form={form} readOnly />
        <BasicInfoSection form={form} readOnly />
        <IdentifiersSection form={form} readOnly />
        <FormatSection form={form} readOnly />
        <PublicationSection form={form} readOnly />
        <PhysicalPropertiesSection form={form} readOnly />
        <DescriptionSection form={form} readOnly />
      </div>
    </Form>
  );
}
