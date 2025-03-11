
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormatFormValues } from "@/hooks/useFormatForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface SizeSectionProps {
  form: UseFormReturn<FormatFormValues>;
  readOnly?: boolean;
}

export function SizeSection({ form, readOnly = false }: SizeSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Size Information</h3>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="orientation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orientation</FormLabel>
              <Select 
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={readOnly}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-2" />
        <h4 className="text-md font-medium">TPS Dimensions</h4>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="tps_height_mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TPS Height (mm)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 210" 
                    {...field} 
                    disabled={readOnly} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tps_width_mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TPS Width (mm)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 148" 
                    {...field} 
                    disabled={readOnly} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tps_depth_mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TPS Depth (mm)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 15" 
                    {...field} 
                    disabled={readOnly} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-2" />
        <h4 className="text-md font-medium">PLC Dimensions</h4>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="tps_plc_height_mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PLC Height (mm)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 220" 
                    {...field} 
                    disabled={readOnly} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tps_plc_width_mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PLC Width (mm)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 158" 
                    {...field} 
                    disabled={readOnly} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tps_plc_depth_mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PLC Depth (mm)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 20" 
                    {...field} 
                    disabled={readOnly} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
