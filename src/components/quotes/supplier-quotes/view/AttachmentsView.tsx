
import { useState, useEffect } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, Download, Paperclip, Eye } from "lucide-react";
import { getAttachments } from "@/api/supplierQuotes";
import { getPublicUrl } from "@/api/supplierQuotes";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AttachmentsViewProps {
  quote: SupplierQuote;
}

export function AttachmentsView({ quote }: AttachmentsViewProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAttachments() {
      if (quote.id) {
        setIsLoading(true);
        try {
          const attachments = await getAttachments(quote.id);
          setFiles(attachments || []);
        } catch (error) {
          console.error("Error fetching attachments:", error);
          toast({
            title: "Error",
            description: "Failed to load attachments",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchAttachments();
  }, [quote.id, toast]);

  const handlePreview = async (file: any) => {
    try {
      setPreviewFile(file);
      // Get signed URL for the file
      const signedUrl = await getPublicUrl('quote-attachments', file.file_key);
      setPreviewUrl(signedUrl);
    } catch (error) {
      console.error("Error getting preview URL:", error);
      toast({
        title: "Error",
        description: "Failed to preview file",
        variant: "destructive",
      });
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const renderPreviewContent = () => {
    if (!previewFile || !previewUrl) return null;

    const fileType = previewFile.file_type || '';

    if (fileType.startsWith('image/')) {
      return <img src={previewUrl} alt={previewFile.file_name} className="max-w-full max-h-[70vh]" />;
    } else if (fileType === 'application/pdf') {
      return (
        <iframe 
          src={`${previewUrl}#toolbar=0`} 
          className="w-full h-[70vh]" 
          title={previewFile.file_name}
        />
      );
    } else {
      return (
        <div className="text-center p-10">
          <FileIcon className="h-16 w-16 mx-auto mb-4 text-primary" />
          <p>Preview not available for this file type.</p>
          <Button onClick={() => window.open(previewFile.url, '_blank')} className="mt-4">
            <Download className="h-4 w-4 mr-2" />
            Download to view
          </Button>
        </div>
      );
    }
  };

  // If no attachments
  if (files.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Paperclip className="w-5 h-5 mr-2" />
            Attachments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm italic">No attachments</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Paperclip className="w-5 h-5 mr-2" />
          Attachments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm">Loading attachments...</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.file_size ? `${(file.file_size / 1024).toFixed(2)} KB` : 'Unknown size'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePreview(file)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{previewFile?.file_name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex justify-center overflow-auto">
            {renderPreviewContent()}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={closePreview} className="mr-2">
              Close
            </Button>
            {previewFile && (
              <Button onClick={() => window.open(previewFile.url, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
