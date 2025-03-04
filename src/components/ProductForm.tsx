import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  isbn13: z.string().optional(),
  isbn10: z.string().optional(),
  product_form: z.string().optional(),
  product_form_detail: z.string().optional(),
  publisher_name: z.string().optional(),
  series_name: z.string().optional(),
  publication_date: z.date().optional().nullable(),
  list_price: z.coerce.number().optional().nullable(),
  currency_code: z.string().optional(),
  language_code: z.string().optional(),
  subject_code: z.string().optional(),
  product_availability_code: z.string().optional(),
  short_description: z.string().optional(),
  long_description: z.string().optional(),
  page_count: z.coerce.number().optional().nullable(),
  edition_number: z.coerce.number().optional().nullable(),
  height_measurement: z.coerce.number().optional().nullable(),
  width_measurement: z.coerce.number().optional().nullable(),
  thickness_measurement: z.coerce.number().optional().nullable(),
  weight_measurement: z.coerce.number().optional().nullable(),
  cover_image_url: z.string().optional(),
});

const productFormOptions = {
  productForms: [
    { value: "BA", label: "Book" },
    { value: "BB", label: "Hardcover" },
    { value: "BC", label: "Paperback" },
    { value: "JB", label: "Journal" },
    { value: "DG", label: "Electronic" },
    { value: "XA", label: "Custom" },
  ],
  currencyCodes: [
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
    { value: "CAD", label: "Canadian Dollar (CAD)" },
    { value: "AUD", label: "Australian Dollar (AUD)" },
  ],
  languageCodes: [
    { value: "eng", label: "English" },
    { value: "spa", label: "Spanish" },
    { value: "fre", label: "French" },
    { value: "ger", label: "German" },
    { value: "ita", label: "Italian" },
    { value: "por", label: "Portuguese" },
    { value: "chi", label: "Chinese" },
    { value: "jpn", label: "Japanese" },
  ],
  availabilityCodes: [
    { value: "IP", label: "In Print" },
    { value: "OS", label: "Out of Stock" },
    { value: "OI", label: "Out of Print" },
    { value: "RP", label: "Reprint" },
    { value: "AD", label: "Available Direct" },
  ],
};

type ProductFormProps = {
  productId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function ProductForm({ productId, onSuccess, onCancel }: ProductFormProps) {
  const { currentOrganization } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!productId;

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      isbn13: "",
      isbn10: "",
      product_form: "",
      product_form_detail: "",
      publisher_name: "",
      series_name: "",
      publication_date: null,
      list_price: null,
      currency_code: "USD",
      language_code: "",
      subject_code: "",
      product_availability_code: "",
      short_description: "",
      long_description: "",
      page_count: null,
      edition_number: null,
      height_measurement: null,
      width_measurement: null,
      thickness_measurement: null,
      weight_measurement: null,
      cover_image_url: "",
    },
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

  async function onSubmit(values: z.infer<typeof productSchema>) {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Cover Image</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="cover_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/cover.jpg" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              {form.watch('cover_image_url') && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <div className="border rounded overflow-hidden w-32 h-48">
                    <img 
                      src={form.watch('cover_image_url')} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Product title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle</FormLabel>
                  <FormControl>
                    <Input placeholder="Subtitle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publisher_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publisher</FormLabel>
                  <FormControl>
                    <Input placeholder="Publisher name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="series_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Series</FormLabel>
                  <FormControl>
                    <Input placeholder="Series name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="edition_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edition</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Edition number" 
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value, 10) : null;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Identifiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isbn13"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN-13</FormLabel>
                  <FormControl>
                    <Input placeholder="ISBN-13" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isbn10"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN-10</FormLabel>
                  <FormControl>
                    <Input placeholder="ISBN-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Subject classification code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Product Format</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="product_form"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Format</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productFormOptions.productForms.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product_form_detail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format Details</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional format details" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product_availability_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productFormOptions.availabilityCodes.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productFormOptions.languageCodes.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Publication and Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="publication_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Publication Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !field.value ? "text-muted-foreground" : ""
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="page_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pages</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Number of pages" 
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value, 10) : null;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="list_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>List Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : null;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productFormOptions.currencyCodes.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Physical Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="height_measurement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (mm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="Height" 
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : null;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="width_measurement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width (mm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="Width" 
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : null;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="thickness_measurement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thickness (mm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="Thickness" 
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : null;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="weight_measurement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (g)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="Weight" 
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : null;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Description</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description" 
                      className="resize-none" 
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="long_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed description" 
                      className="resize-none" 
                      rows={5}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
