
import { Form } from "@/components/ui/form";
import { useProductForm } from "@/hooks/useProductForm";
import { CoverImageSection } from "./products/form-sections/CoverImageSection";
import { BasicInfoSection } from "./products/form-sections/BasicInfoSection";
import { IdentifiersSection } from "./products/form-sections/IdentifiersSection";
import { FormatSection } from "./products/form-sections/FormatSection";
import { PublicationSection } from "./products/form-sections/PublicationSection";
import { PhysicalPropertiesSection } from "./products/form-sections/PhysicalPropertiesSection";
import { DescriptionSection } from "./products/form-sections/DescriptionSection";
import { CartonSection } from "./products/form-sections/CartonSection";
import { AdditionalInfoSection } from "./products/form-sections/AdditionalInfoSection";
import { InternalImagesSection } from "./products/form-sections/InternalImagesSection";
import { StockTable } from "./products/form-sections/StockTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <CartonSection form={form} readOnly />
        <DescriptionSection form={form} readOnly />
        <AdditionalInfoSection form={form} readOnly />
        <InternalImagesSection form={form} readOnly />
        
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <StockTable productId={productId} readOnly />
          </CardContent>
        </Card>
      </div>
    </Form>
  );
}
