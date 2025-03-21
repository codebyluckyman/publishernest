
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuote, SupplierQuoteAttachment } from "@/types/supplierQuote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Paperclip, Trash2, Download } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getSupplierQuoteAttachments } from "@/api/supplierQuotes/getAttachments";

interface SupplierQuoteAttachmentsProps {
  supplierQuote: SupplierQuote;
  readOnly?: boolean;
  onAttachmentsChange?: () => void;
}

export function SupplierQuoteAttachments({
  supplierQuote,
  readOnly = false,
  onAttachmentsChange
}: SupplierQuoteAttachmentsProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<SupplierQuoteAttachment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState<SupplierQuoteAttachment[]>(supplierQuote.attachments || []);

  useEffect(() => {
    const loadAttachments = async () => {
      const fetched = await getSupplierQuoteAttachments(supplierQuote.id);
      setAttachments(fetched);
    };
    
    loadAttachments();
  }, [supplierQuote.id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload file to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${supplierQuote.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('quote-attachments')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Create record in database using a raw query approach
        const { error: dbError } = await supabase.rpc('add_quote_attachment', {
          p_supplier_quote_id: supplierQuote.id,
          p_file_name: file.name,
          p_file_key: filePath,
          p_file_size: file.size,
          p_file_type: file.type,
          p_uploaded_by: user?.id
        });
        
        if (dbError) {
          console.error("Error creating attachment record:", dbError);
          // Try fallback direct insert
          const { error: directError } = await supabase.from('supplier_quote_attachments').insert({
            supplier_quote_id: supplierQuote.id,
            file_name: file.name,
            file_key: filePath,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: user?.id
          });
          
          if (directError) {
            throw directError;
          }
        }
      }
      
      toast.success("Files uploaded successfully");
      // Refresh attachments
      const refreshed = await getSupplierQuoteAttachments(supplierQuote.id);
      setAttachments(refreshed);
      
      if (onAttachmentsChange) {
        onAttachmentsChange();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    } finally {
      setIsUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };
  
  const handleDownload = async (attachment: SupplierQuoteAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('quote-attachments')
        .download(attachment.file_key);
        
      if (error) {
        throw error;
      }
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading file");
    }
  };
  
  const handleDeleteClick = (attachment: SupplierQuoteAttachment) => {
    setAttachmentToDelete(attachment);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!attachmentToDelete) return;
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('quote-attachments')
        .remove([attachmentToDelete.file_key]);
        
      if (storageError) {
        throw storageError;
      }
      
      // Delete from database using RPC
      const { error: dbError } = await supabase.rpc('delete_quote_attachment', {
        attachment_id: attachmentToDelete.id
      });
      
      if (dbError) {
        console.error("Error deleting with RPC:", dbError);
        // Try fallback direct delete
        const { error: directError } = await supabase
          .from('supplier_quote_attachments')
          .delete()
          .eq('id', attachmentToDelete.id);
          
        if (directError) {
          throw directError;
        }
      }
      
      toast.success("File deleted successfully");
      // Update attachments list by filtering out the deleted one
      setAttachments(attachments.filter(a => a.id !== attachmentToDelete.id));
      
      if (onAttachmentsChange) {
        onAttachmentsChange();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error deleting file");
    } finally {
      setDeleteDialogOpen(false);
      setAttachmentToDelete(null);
    }
  };
  
  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="mb-4">
          <Label htmlFor="file-upload" className="block mb-2">Upload Attachments</Label>
          <Input
            id="file-upload"
            type="file"
            multiple
            disabled={isUploading}
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {isUploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
        </div>
      )}
      
      <div className="space-y-2">
        {attachments && attachments.length > 0 ? (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between border rounded-md p-3 shadow-sm"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Paperclip className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{attachment.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.file_size)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                {!readOnly && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClick(attachment)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No attachments</p>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attachment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
