
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Format } from "./types/FormatTypes";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface FormatCopyDialogProps {
  format: Format;
  onFormatCopied?: (newFormatId?: string) => void;
  triggerElement?: React.ReactNode;
}

export function FormatCopyDialog({ format, onFormatCopied, triggerElement }: FormatCopyDialogProps) {
  const [isCopying, setIsCopying] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [open, setIsOpen] = useState(false);

  const copyFormat = async () => {
    setIsCopying(true);
    try {
      const { data: formatData, error: fetchError } = await supabase
        .from("formats")
        .select("*")
        .eq("id", format.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      if (!formatData) {
        throw new Error("Format not found");
      }
      
      const newFormatData = {
        ...formatData,
        id: undefined,
        format_name: `${formatData.format_name} (Copy)`,
        created_at: undefined,
        updated_at: undefined,
      };
      
      const { data: newFormat, error: insertError } = await supabase
        .from("formats")
        .insert(newFormatData)
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      toast.success(`Format "${format.format_name}" copied successfully`);
      
      setCopyDialogOpen(false);
      
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
    <AlertDialog open={copyDialogOpen} onOpenChange={(open) => {
      setCopyDialogOpen(open);
      setIsOpen(false);
      if (!open && onFormatCopied) {
        onFormatCopied(); // Notify parent when dialog is closed
      }
    }}>
      <AlertDialogTrigger asChild>
        {triggerElement ? triggerElement : (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setCopyDialogOpen(true);
            }}
            title="Copy format"
            disabled={isCopying}
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
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
  );
}
