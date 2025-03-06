
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";

interface CartonSectionProps {
  form: UseFormReturn<ProductFormValues>;
  readOnly?: boolean;
}

export function CartonSection({ form, readOnly = false }: CartonSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Carton Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Move carton quantity and carton weight to be side by side */}
        <FormField
          control={form.control}
          name="carton_quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carton Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Number of units per carton" 
                  disabled={readOnly}
                  {...field}
                  value={field.value === null ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : null;
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
          name="carton_weight_kg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carton Weight (kg)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="Weight" 
                  disabled={readOnly}
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
        
        <div className="md:col-span-2">
          <h4 className="text-sm font-medium mb-2">Carton Dimensions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="carton_length_mm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length (mm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="Length" 
                      disabled={readOnly}
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
              name="carton_width_mm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width (mm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="Width" 
                      disabled={readOnly}
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
              name="carton_height_mm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (mm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="Height" 
                      disabled={readOnly}
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
      </div>
    </div>
  );
}
