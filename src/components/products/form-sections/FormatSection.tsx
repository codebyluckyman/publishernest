import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "sonner";
import FormatDialog from "../../FormatDialog";

interface Format {
  id: string;
  format_name: string;
  extent?: string;
  cover_stock_print?: string;
  internal_stock_print?: string;
  tps_height_mm?: number;
  tps_width_mm?: number;
  tps_depth_mm?: number;
  tps_plc_height_mm?: number;
  tps_plc_width_mm?: number;
  tps_plc_depth_mm?: number;
}

interface FormatSectionProps {
  form: UseFormReturn<ProductFormValues>;
  readOnly?: boolean;
}

export function FormatSection({ form, readOnly = false }: FormatSectionProps) {
  const { currentOrganization } = useOrganization();
  const [formats, setFormats] = useState<Format[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  
  const formatId = form.watch('format_id');

  const fetchFormats = async () => {
    if (!currentOrganization) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("formats")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .order("format_name");
        
      if (error) {
        throw error;
      }
      
      setFormats(data || []);
    } catch (error: any) {
      toast.error("Failed to load formats: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFormats();
  }, [currentOrganization]);

  // Update the selected format when formatId changes
  useEffect(() => {
    if (formatId) {
      const format = formats.find(f => f.id === formatId);
      setSelectedFormat(format || null);
    } else {
      setSelectedFormat(null);
    }
  }, [formatId, formats]);

  const handleAddFormat = () => {
    setSelectedFormatId(null);
    setIsDialogOpen(true);
  };

  const handleEditFormat = () => {
    if (formatId) {
      setSelectedFormatId(formatId);
      setIsDialogOpen(true);
    }
  };

  const handleFormatSuccess = () => {
    fetchFormats();
    setIsDialogOpen(false);
  };

  // Format dimensions in HxWxD format
  const formatTextDimensions = (format: Format) => {
    if (!format.tps_height_mm && !format.tps_width_mm && !format.tps_depth_mm) {
      return "N/A";
    }
    
    const height = format.tps_height_mm + 'mm';
    const width = format.tps_width_mm + 'mm';
    
    // Only include depth if it has a value
    if (format.tps_depth_mm) {
      return `${height} × ${width} × ${format.tps_depth_mm}mm`;
    }
    
    // Otherwise just show height and width
    return `${height} × ${width}`;
  };

  // Format PLC dimensions in HxWxD format
  const formatPlcDimensions = (format: Format) => {
    if (!format.tps_plc_height_mm && !format.tps_plc_width_mm && !format.tps_plc_depth_mm) {
      return "N/A";
    }
    
    const height = format.tps_plc_height_mm + 'mm';
    const width = format.tps_plc_width_mm + 'mm';
    
    // Only include depth if it has a value
    if (format.tps_plc_depth_mm) {
      return `${height} × ${width} × ${format.tps_plc_depth_mm}mm`;
    }
    
    // Otherwise just show height and width
    return `${height} × ${width}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Format</h3>
        {!readOnly && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddFormat} 
            className="gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Add Format
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="format_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Format</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
                value={field.value || undefined}
                disabled={readOnly}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formats.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      {format.format_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedFormat && (
          <div className="p-4 border rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Format Details</h4>
              {!readOnly && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleEditFormat}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-2 text-sm text-black">
              <p><span className="font-medium">Extent:</span> {selectedFormat.extent || "N/A"}</p>
              <p><span className="font-medium">Text Dimensions:</span> {formatTextDimensions(selectedFormat)}</p>
              <p><span className="font-medium">PLC Dimensions:</span> {formatPlcDimensions(selectedFormat)}</p>
              <p><span className="font-medium">Cover Stock/Print:</span> {selectedFormat.cover_stock_print || "N/A"}</p>
              <p><span className="font-medium">Internal Stock/Print:</span> {selectedFormat.internal_stock_print || "N/A"}</p>
            </div>
          </div>
        )}
      </div>

      {!readOnly && (
        <FormatDialog
          open={isDialogOpen}
          formatId={selectedFormatId}
          onOpenChange={setIsDialogOpen}
          onSuccess={handleFormatSuccess}
        />
      )}
    </div>
  );
}
