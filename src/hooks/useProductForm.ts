
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProducts } from './useProducts';
import { Product, ProductFormValues } from '@/types/product';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  isbn13: z.string().optional(),
  isbn10: z.string().optional(),
  publisher_name: z.string().optional(),
  publication_date: z.date().optional(),
  product_form: z.string().optional(),
  product_form_detail: z.string().optional(),
  status: z.string().default('active'),
  list_price: z.number().optional(),
  currency_code: z.string().optional(),
  height_measurement: z.number().optional(),
  width_measurement: z.number().optional(),
  thickness_measurement: z.number().optional(),
  weight_measurement: z.number().optional(),
  page_count: z.number().optional(),
  edition_number: z.number().optional(),
  carton_quantity: z.number().optional(),
  carton_length_mm: z.number().optional(),
  carton_width_mm: z.number().optional(),
  carton_height_mm: z.number().optional(),
  carton_weight_kg: z.number().optional(),
  format_id: z.string().optional(),
  format_extras: z.object({
    foil: z.boolean().optional(),
    spot_uv: z.boolean().optional(),
    glitter: z.boolean().optional(),
    embossing: z.boolean().optional(),
    die_cut: z.boolean().optional(),
    holographic: z.boolean().optional(),
  }).optional(),
  format_extra_comments: z.string().optional(),
  synopsis: z.string().optional(),
  series_name: z.string().optional(),
  age_range: z.string().optional(),
  license: z.string().optional(),
  language_code: z.string().optional(),
  subject_code: z.string().optional(),
  product_availability_code: z.string().optional(),
  cover_image_url: z.string().optional(),
  internal_images: z.array(z.string()).optional(),
  selling_points: z.string().optional(),
});

export function useProductForm(product?: Product) {
  const { createProduct, updateProduct, deleteProduct } = useProducts();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      title: product.title,
      subtitle: product.subtitle || '',
      isbn13: product.isbn13 || '',
      isbn10: product.isbn10 || '',
      publisher_name: product.publisher_name || '',
      publication_date: product.publication_date ? new Date(product.publication_date) : undefined,
      product_form: product.product_form || '',
      product_form_detail: product.product_form_detail || '',
      status: product.status || 'active',
      list_price: product.list_price || undefined,
      currency_code: product.currency_code || 'USD',
      height_measurement: product.height_measurement || undefined,
      width_measurement: product.width_measurement || undefined,
      thickness_measurement: product.thickness_measurement || undefined,
      weight_measurement: product.weight_measurement || undefined,
      page_count: product.page_count || undefined,
      edition_number: product.edition_number || undefined,
      carton_quantity: product.carton_quantity || undefined,
      carton_length_mm: product.carton_length_mm || undefined,
      carton_width_mm: product.carton_width_mm || undefined,
      carton_height_mm: product.carton_height_mm || undefined,
      carton_weight_kg: product.carton_weight_kg || undefined,
      format_id: product.format_id || '',
      format_extras: product.format_extras || {
        foil: false,
        spot_uv: false,
        glitter: false,
        embossing: false,
        die_cut: false,
        holographic: false,
      },
      format_extra_comments: product.format_extra_comments || '',
      synopsis: product.synopsis || '',
      series_name: product.series_name || '',
      age_range: product.age_range || '',
      license: product.license || '',
      language_code: product.language_code || '',
      subject_code: product.subject_code || '',
      product_availability_code: product.product_availability_code || '',
      cover_image_url: product.cover_image_url || '',
      internal_images: product.internal_images || [],
      selling_points: product.selling_points || '',
    } : {
      title: '',
      status: 'active',
      currency_code: 'USD',
      format_extras: {
        foil: false,
        spot_uv: false,
        glitter: false,
        embossing: false,
        die_cut: false,
        holographic: false,
      },
      internal_images: [],
    }
  });

  const submitProduct = async (productData: Partial<Product>, isEditing = false) => {
    if (isEditing && product?.id) {
      await updateProduct.mutateAsync({ id: product.id, ...productData });
    } else {
      await createProduct.mutateAsync(productData);
    }
  };

  const isLoading = createProduct.isPending || updateProduct.isPending || deleteProduct.isPending;

  return {
    form,
    submitProduct,
    deleteProduct: deleteProduct.mutateAsync,
    isLoading,
    isEditMode: !!product,
    onSubmit: form.handleSubmit
  };
}
