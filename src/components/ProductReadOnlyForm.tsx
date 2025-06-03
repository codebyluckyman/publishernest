
import { Form } from "@/components/ui/form";
import { useProductForm } from "@/hooks/useProductForm";
import { CoverImageSection } from "./products/form-sections/CoverImageSection";
import { BasicInfoSection } from "./products/form-sections/BasicInfoSection";
import { IdentifiersSection } from "./products/form-sections/IdentifiersSection";
import { FormatSection } from "./products/form-sections/FormatSection";
import { FormatExtrasSection } from "./products/form-sections/FormatExtrasSection";
import { PublicationSection } from "./products/form-sections/PublicationSection";
import { PhysicalPropertiesSection } from "./products/form-sections/PhysicalPropertiesSection";
import { CartonSection } from "./products/form-sections/CartonSection";
import { AdditionalInfoSection } from "./products/form-sections/AdditionalInfoSection";
import { InternalImagesSection } from "./products/form-sections/InternalImagesSection";
import { PricingSection } from "./products/form-sections/PricingSection";
import { StockTable } from "./products/form-sections/StockTable";
import { CustomFieldsSection } from "./products/custom-fields/CustomFieldsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

type ProductReadOnlyFormProps = {
  productId: string;
};

export const ProductReadOnlyForm = ({ productId }: ProductReadOnlyFormProps) => {
  const { form, isLoading } = useProductForm(productId, () => {});
  const [formReady, setFormReady] = useState(false);

  // Wait for form to be loaded with values before showing
  useEffect(() => {
    if (!isLoading) {
      // Allow some time for all hooks to populate the form
      const timer = setTimeout(() => {
        setFormReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!formReady) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="h-6 w-48 bg-gray-200 animate-pulse rounded"></CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  console.log("ProductReadOnlyForm - form values:", form.getValues());

  return (
    <Form {...form}>
      <div className="space-y-6">
        <CoverImageSection form={form} readOnly />
        <BasicInfoSection form={form} readOnly />
        <IdentifiersSection form={form} readOnly />
        <FormatSection form={form} readOnly />
        <FormatExtrasSection form={form} readOnly />
        <PublicationSection form={form} readOnly />
        <PhysicalPropertiesSection form={form} readOnly />
        <CartonSection form={form} readOnly />
        <AdditionalInfoSection form={form} readOnly />
        <InternalImagesSection form={form} readOnly />
        
        <CustomFieldsSection productId={productId} readOnly />
        
        <PricingSection form={form} productId={productId} readOnly />
        
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
};

export default ProductReadOnlyForm;
