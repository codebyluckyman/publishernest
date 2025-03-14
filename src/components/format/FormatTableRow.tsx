
import { Eye, Pencil, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreateQuoteRequestFromFormat } from "../quotes/CreateQuoteRequestFromFormat";

export interface Format {
  id: string;
  format_name: string;
  tps_height_mm: number | null;
  tps_width_mm: number | null;
  tps_depth_mm: number | null;
  tps_plc_height_mm: number | null;
  tps_plc_width_mm: number | null;
  tps_plc_depth_mm: number | null;
  extent: string | null;
  cover_stock_print: string | null;
  internal_stock_print: string | null;
  created_at: string;
  updated_at: string;
}

interface FormatTableRowProps {
  format: Format;
  onViewFormat: (formatId: string) => void;
  onEditFormat: (formatId: string) => void;
  formatDate: (dateString: string | null) => string;
  onFormatCopied?: (newFormatId?: string) => void;
}

export function FormatTableRow({ format, onViewFormat, onEditFormat, formatDate, onFormatCopied }: FormatTableRowProps) {
  const [isCopying, setIsCopying] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  
  // Format text dimensions in HxWxD format
  const formatTextDimensions = () => {
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
  const formatPlcDimensions = () => {
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

  const copyFormat = async () => {
    setIsCopying(true);
    try {
      // 1. Get the current format data
      const { data: formatData, error: fetchError } = await supabase
        .from("formats")
        .select("*")
        .eq("id", format.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      if (!formatData) {
        throw new Error("Format not found");
      }
      
      // 2. Create a new format with the same data but a different name
      const newFormatData = {
        ...formatData,
        id: undefined, // Let Supabase generate a new ID
        format_name: `${formatData.format_name} (Copy)`,
        created_at: undefined, // Let Supabase set this
        updated_at: undefined, // Let Supabase set this
      };
      
      // 3. Insert the new format
      const { data: newFormat, error: insertError } = await supabase
        .from("formats")
        .insert(newFormatData)
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      toast.success(`Format "${format.format_name}" copied successfully`);
      
      // Close the copy dialog
      setCopyDialogOpen(false);
      
      // 4. Notify parent component to refresh the list and open the edit form
      if (onFormatCopied && newFormat) {
        onFormatCopied(newFormat.id);
      }
    } catch (error: any) {
      toast.error(`Failed to copy format: ${error.message}`);
      console.error("Error copying format:", error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <TableRow 
      key={format.id}
      className="cursor-pointer"
      onClick={() => onViewFormat(format.id)}
    >
      <TableCell className="font-medium">{format.format_name}</TableCell>
      <TableCell>{formatTextDimensions()}</TableCell>
      <TableCell>{formatPlcDimensions()}</TableCell>
      <TableCell>{format.extent || "N/A"}</TableCell>
      <TableCell>{format.cover_stock_print || "N/A"}</TableCell>
      <TableCell>{format.internal_stock_print || "N/A"}</TableCell>
      <TableCell>{formatDate(format.created_at)}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              onViewFormat(format.id);
            }}
            title="View format"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              onEditFormat(format.id);
            }}
            title="Edit format"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setCopyDialogOpen(true);
                }}
                title="Copy format"
                disabled={isCopying}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Copy Format</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to create a copy of "{format.format_name}"? A new format will be created with all the same properties.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCopyDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={(e) => {
                    e.preventDefault();
                    copyFormat();
                  }}
                  disabled={isCopying}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isCopying ? "Copying..." : "Copy Format"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Add Create Quote Request button */}
          <div onClick={(e) => e.stopPropagation()}>
            <CreateQuoteRequestFromFormat
              formatId={format.id}
              buttonVariant="ghost"
              buttonSize="icon"
              buttonText=""
              buttonIcon={true}
            />
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
