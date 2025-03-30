
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface AttachmentsSectionProps {
  supplierQuote: { id: string };
  supplierName: string | undefined;
}

export function AttachmentsSection({ supplierQuote, supplierName }: AttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch existing attachments on component mount
  const fetchAttachments = useCallback(async () => {
    if (!supplierQuote.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('supplier_quote_attachments')
        .select('*')
        .eq('supplier_quote_id', supplierQuote.id);
        
      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      toast({
        title: "Error fetching attachments",
        description: "Could not load existing attachments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [supplierQuote.id, toast]);

  // Upload files
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!supplierQuote.id || !user) return;
    
    setIsUploading(true);
    
    for (const file of acceptedFiles) {
      try {
        // Upload file to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${supplierName ? supplierName.replace(/\s+/g, '-').toLowerCase() : 'supplier'}-${Date.now()}.${fileExt}`;
        const filePath = `quotes/${supplierQuote.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        // Create record in database
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
        
        // Refresh attachment list
        fetchAttachments();
        
        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
        
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive"
        });
      }
    }
    
    setIsUploading(false);
  }, [supplierQuote.id, user, supplierName, fetchAttachments, toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  
  // Delete attachment
  const handleDelete = async (attachment: any) => {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([attachment.file_key]);
        
      if (storageError) throw storageError;
      
      // Delete record from database
      const { error: dbError } = await supabase
        .from('supplier_quote_attachments')
        .delete()
        .eq('id', attachment.id);
        
      if (dbError) throw dbError;
      
      // Update local state
      setAttachments(current => current.filter(a => a.id !== attachment.id));
      
      toast({
        title: "File deleted",
        description: `${attachment.file_name} has been deleted.`
      });
      
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the attachment",
        variant: "destructive"
      });
    }
  };
  
  // Download attachment
  const handleDownload = async (attachment: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .download(attachment.file_key);
        
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the file",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Attachments</h3>
      
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-gray-400" />
          {isDragActive ? (
            <p className="text-primary font-medium">Drop the files here...</p>
          ) : (
            <>
              <p className="font-medium">Drag and drop files here, or click to select files</p>
              <p className="text-sm text-gray-500">
                Upload any files relevant to your quote (PDFs, images, etc.)
              </p>
            </>
          )}
        </div>
      </div>
      
      {isUploading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Uploading files...</span>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading attachments...</span>
        </div>
      ) : attachments.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded Files</h4>
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{attachment.file_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(attachment.created_at).toLocaleDateString()}
                        {attachment.file_size && ` • ${(attachment.file_size / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDownload(attachment)}
                    >
                      Download
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(attachment)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No attachments yet. Upload files to include with your quote.
        </div>
      )}
    </div>
  );
}
