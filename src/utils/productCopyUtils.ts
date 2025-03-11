
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Organization } from "@/types/organization";

export const copyProduct = async (
  productId: string, 
  currentOrganization: Organization | null
): Promise<string> => {
  if (!currentOrganization) {
    toast.error("No organization selected");
    throw new Error("No organization selected");
  }

  try {
    const { data: productToCopy, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError || !productToCopy) {
      throw new Error("Failed to fetch product to copy");
    }

    // Create a new object without id, created_at, and updated_at fields
    const newProductData = {
      organization_id: productToCopy.organization_id,
      title: `${productToCopy.title} (Copy)`,
      subtitle: productToCopy.subtitle,
      isbn13: null, // ISBN must be unique
      isbn10: null, // ISBN must be unique
      product_form: productToCopy.product_form,
      product_form_detail: productToCopy.product_form_detail,
      series_name: productToCopy.series_name,
      edition_number: productToCopy.edition_number,
      language_code: productToCopy.language_code,
      page_count: productToCopy.page_count,
      publisher_name: productToCopy.publisher_name,
      publication_date: productToCopy.publication_date,
      list_price: productToCopy.list_price,
      currency_code: productToCopy.currency_code,
      product_availability_code: productToCopy.product_availability_code,
      subject_code: productToCopy.subject_code,
      height_measurement: productToCopy.height_measurement,
      width_measurement: productToCopy.width_measurement,
      thickness_measurement: productToCopy.thickness_measurement,
      weight_measurement: productToCopy.weight_measurement,
      cover_image_url: productToCopy.cover_image_url,
      format_id: productToCopy.format_id,
      internal_images: productToCopy.internal_images,
      carton_quantity: productToCopy.carton_quantity,
      carton_length_mm: productToCopy.carton_length_mm,
      carton_width_mm: productToCopy.carton_width_mm,
      carton_height_mm: productToCopy.carton_height_mm,
      carton_weight_kg: productToCopy.carton_weight_kg,
      age_range: productToCopy.age_range,
      synopsis: productToCopy.synopsis,
      license: productToCopy.license
    };

    const { data: newProduct, error: insertError } = await supabase
      .from("products")
      .insert(newProductData)
      .select()
      .single();

    if (insertError || !newProduct) {
      console.error("Error creating new product:", insertError);
      throw new Error("Failed to create new product");
    }

    // Copy associated prices
    const { data: prices, error: pricesError } = await supabase
      .from("product_prices")
      .select("*")
      .eq("product_id", productId);

    if (!pricesError && prices && prices.length > 0) {
      const newPrices = prices.map(price => ({
        product_id: newProduct.id,
        organization_id: price.organization_id,
        price: price.price,
        currency_code: price.currency_code,
        is_default: price.is_default
      }));

      await supabase.from("product_prices").insert(newPrices);
    }

    toast.success("Product copied successfully");
    
    // Return the new product ID so it can be used to open the edit form
    return newProduct.id;
  } catch (error) {
    console.error("Error copying product:", error);
    toast.error("Failed to copy product: " + (error as Error).message);
    throw error;
  }
};
