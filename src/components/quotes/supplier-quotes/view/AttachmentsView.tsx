
import { useState, useEffect } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, Download, Paperclip } from "lucide-react";
import { getSupplierQuoteAttachments } from "@/api/supplierQuotes/getAttachments";
import { useToast } from "@/components/ui/use-toast";

interface AttachmentsViewProps {
  quote: SupplierQuote;
}

export function AttachmentsView({ quote }: AttachmentsViewProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAttachments() {
      if (quote.id) {
        setIsLoading(true);
        try {
          const attachments = await getSupplierQuoteAttachments(quote.id);
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

  function getFileIcon(fileType: string) {
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'excel';
    if (fileType.includes('word') || fileType.includes('document')) return 'word';
    return 'generic';
  }

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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(file.url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
