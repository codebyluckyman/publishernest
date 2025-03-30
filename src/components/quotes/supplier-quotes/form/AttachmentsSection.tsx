
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDropzone } from "react-dropzone";
import { Upload, File, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteAttachment } from "@/types/supplierQuote";
import { useAuth } from "@/context/AuthContext";

interface AttachmentsSectionProps {
  supplierQuote: { id: string };
  supplierName?: string;
}

export function AttachmentsSection({ supplierQuote, supplierName }: AttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<SupplierQuoteAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  // Fetch attachments on initial load
  useState(() => {
    if (supplierQuote.id) {
      fetchAttachments();
    }
  });

  const fetchAttachments = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_quote_attachments')
        .select('*')
        .eq('supplier_quote_id', supplierQuote.id);
        
      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      toast.error("Failed to load attachments");
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!supplierQuote.id || !user) {
      toast.error("Cannot upload files at this time");
      return;
    }

    setIsUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        // Upload file to storage
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `supplier-quotes/${supplierQuote.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        // Add record to database
        const { error: dbError } = await supabase
          .from('supplier_quote_attachments')
          .insert({
            supplier_quote_id: supplierQuote.id,
            file_name: file.name,
            file_key: filePath,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: user.id
          });
          
        if (dbError) throw dbError;
      }
      
      fetchAttachments();
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  }, [supplierQuote.id, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  });

  const downloadAttachment = async (attachment: SupplierQuoteAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .download(attachment.file_key);
        
      if (error) throw error;
      
      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const deleteAttachment = async (id: string, fileKey: string) => {
    try {
      // Delete record from database
      const { error: dbError } = await supabase
        .from('supplier_quote_attachments')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([fileKey]);
        
      if (storageError) throw storageError;
      
      // Update UI
      setAttachments(attachments.filter(a => a.id !== id));
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Attachments</h3>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors 
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-8 w-8 text-gray-400" />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <>
              <p>Drag & drop files here, or click to select files</p>
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, Word, Excel, JPEG, PNG (max 10MB)
              </p>
            </>
          )}
        </div>
      </div>
      
      {isUploading && (
        <div className="text-center py-2 text-muted-foreground">
          Uploading files...
        </div>
      )}
      
      {attachments.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded Files</h4>
          <div className="grid gap-3">
            {attachments.map((attachment) => (
              <Card key={attachment.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{attachment.file_name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>
                            {new Date(attachment.created_at).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>
                            {attachment.file_size
                              ? `${Math.round(attachment.file_size / 1024)} KB`
                              : 'Unknown size'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadAttachment(attachment)}
                      >
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAttachment(attachment.id, attachment.file_key)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No attachments yet
        </div>
      )}
    </div>
  );
}
