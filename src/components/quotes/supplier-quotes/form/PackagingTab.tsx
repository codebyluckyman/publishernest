
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface PackagingTabProps {
  control: Control<SupplierQuoteFormValues>;
}

export function PackagingTab({ control }: PackagingTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Carton Details</CardTitle>
          <CardDescription>
            Information about packaging cartons for shipping calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={control}
              name="packaging_carton_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Copies per Carton</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value === null ? "" : field.value}
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
                      min="0"
                      step="0.01"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value === null ? "" : field.value}
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
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value === null ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="packaging_carton_length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carton Length (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      step="0.1"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value === null ? "" : field.value}
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
                  <FormLabel>Carton Width (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      step="0.1"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value === null ? "" : field.value}
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
                  <FormLabel>Carton Height (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      step="0.1"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value === null ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="packaging_carton_volume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carton Volume (m³)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      step="0.001"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value === null ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Container Capacity</CardTitle>
          <CardDescription>
            Shipping container capacity estimations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="packaging_copies_per_20ft_palletized"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Copies per 20ft Container (Palletized)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value === null ? "" : field.value}
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
                  <FormLabel>Copies per 40ft Container (Palletized)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value === null ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="packaging_copies_per_20ft_unpalletized"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Copies per 20ft Container (Unpalletized)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value === null ? "" : field.value}
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
                  <FormLabel>Copies per 40ft Container (Unpalletized)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value === null ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
