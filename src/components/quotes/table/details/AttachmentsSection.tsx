import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { Upload, File, Trash2, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequestAttachment } from "@/types/quoteRequest";
import { useAuth } from "@/context/AuthContext";
import { getQuoteRequestAttachments } from "@/api/quoteRequests";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPublicUrl } from "@/api/supplierQuotes";

interface AttachmentsSectionProps {
  quoteRequestId: string;
}

export function AttachmentsSection({ quoteRequestId }: AttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<QuoteRequestAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<QuoteRequestAttachment | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch attachments on initial load
  useEffect(() => {
    if (quoteRequestId) {
      fetchAttachments();
    }
  }, [quoteRequestId]);

  const fetchAttachments = async () => {
    try {
      const fetchedAttachments = await getQuoteRequestAttachments(quoteRequestId);
      setAttachments(fetchedAttachments);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      toast.error("Failed to load attachments");
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!quoteRequestId || !user) {
      toast.error("Cannot upload files at this time");
      return;
    }

    setIsUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `quote-requests/${quoteRequestId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { error: dbError } = await supabase
          .from('quote_request_attachments')
          .insert({
            quote_request_id: quoteRequestId,
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
  }, [quoteRequestId, user]);

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

  const handlePreview = async (attachment: QuoteRequestAttachment) => {
    try {
      setPreviewAttachment(attachment);
      const signedUrl = await getPublicUrl('attachments', attachment.file_key);
      setPreviewUrl(signedUrl);
    } catch (error) {
      console.error("Error getting preview URL:", error);
      toast.error("Failed to preview file");
    }
  };

  const closePreview = () => {
    setPreviewAttachment(null);
    setPreviewUrl(null);
  };

  const downloadAttachment = async (attachment: QuoteRequestAttachment) => {
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
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const deleteAttachment = async (id: string, fileKey: string) => {
    try {
      const { error: dbError } = await supabase
        .from('quote_request_attachments')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([fileKey]);
        
      if (storageError) throw storageError;
      
      setAttachments(attachments.filter(a => a.id !== id));
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  const renderPreviewContent = () => {
    if (!previewAttachment || !previewUrl) return null;

    const fileType = previewAttachment.file_type || '';

    if (fileType.startsWith('image/')) {
      return <img src={previewUrl} alt={previewAttachment.file_name} className="max-w-full max-h-[70vh]" />;
    } else if (fileType === 'application/pdf') {
      return (
        <iframe 
          src={`${previewUrl}#toolbar=0`} 
          className="w-full h-[70vh]" 
          title={previewAttachment.file_name}
        />
      );
    } else if (fileType.includes('word') || fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return (
        <div className="text-center p-10">
          <File className="h-16 w-16 mx-auto mb-4 text-primary" />
          <p>Preview not available for this file type.</p>
          <Button onClick={() => downloadAttachment(previewAttachment)} className="mt-4">
            <Download className="h-4 w-4 mr-2" />
            Download to view
          </Button>
        </div>
      );
    } else {
      return (
        <div className="text-center p-10">
          <File className="h-16 w-16 mx-auto mb-4 text-primary" />
          <p>Preview not available for this file type.</p>
          <Button onClick={() => downloadAttachment(previewAttachment)} className="mt-4">
            <Download className="h-4 w-4 mr-2" />
            Download to view
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
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
                        onClick={() => handlePreview(attachment)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadAttachment(attachment)}
                      >
                        <Download className="h-4 w-4 mr-1" />
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

      <Dialog open={!!previewAttachment} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{previewAttachment?.file_name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex justify-center overflow-auto">
            {renderPreviewContent()}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={closePreview} className="mr-2">
              Close
            </Button>
            {previewAttachment && (
              <Button onClick={() => downloadAttachment(previewAttachment)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
