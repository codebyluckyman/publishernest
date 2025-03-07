
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormatFormValues } from "@/hooks/useFormatForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        
        <FormField
          control={form.control}
          name="tps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TPS (Text)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 240 pages" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tps_case"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TPS (Case/PLC)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 120 pages" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="tps_text_height_mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Height (mm)</FormLabel>
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
            name="tps_text_width_mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Width (mm)</FormLabel>
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
            name="tps_text_depth_mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Depth (mm)</FormLabel>
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
      </div>
    </div>
  );
}
