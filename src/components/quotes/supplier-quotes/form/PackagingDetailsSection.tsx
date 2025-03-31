
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";

interface PackagingDetailsSectionProps {
  control: Control<SupplierQuoteFormValues>;
}

export function PackagingDetailsSection({ control }: PackagingDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Packaging Details</h3>
        <p className="text-muted-foreground">
          Provide estimated packaging information for this quote
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="packaging_carton_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carton Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Copies per carton" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="packaging_carton_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carton Weight (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="Weight in kg" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h4 className="text-md font-medium mb-2">Carton Dimensions</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={control}
              name="packaging_carton_length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="Length" 
                      {...field} 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="packaging_carton_width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="Width" 
                      {...field} 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="packaging_carton_height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="Height" 
                      {...field} 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="packaging_carton_volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carton Volume (m³)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.001"
                    placeholder="Volume in cubic meters" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="packaging_cartons_per_pallet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cartons per Pallet</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Cartons per pallet" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h4 className="text-md font-medium mb-2">Container Capacity</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <h5 className="text-sm font-medium">Palletized</h5>
              <FormField
                control={control}
                name="packaging_copies_per_20ft_palletized"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Copies per 20ft Container</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Copies" 
                        {...field} 
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="packaging_copies_per_40ft_palletized"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Copies per 40ft Container</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Copies" 
                        {...field} 
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h5 className="text-sm font-medium">Unpalletized</h5>
              <FormField
                control={control}
                name="packaging_copies_per_20ft_unpalletized"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Copies per 20ft Container</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Copies" 
                        {...field} 
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="packaging_copies_per_40ft_unpalletized"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Copies per 40ft Container</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Copies" 
                        {...field} 
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
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
    </div>
  );
}
