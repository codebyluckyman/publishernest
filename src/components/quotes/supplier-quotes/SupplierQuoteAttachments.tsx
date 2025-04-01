
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SupplierQuoteAttachment } from "@/types/supplierQuote";
import { FileIcon, Download, ExternalLink, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface SupplierQuoteAttachmentsProps {
  attachments: SupplierQuoteAttachment[];
  isLoading?: boolean;
}

export function SupplierQuoteAttachments({
  attachments,
  isLoading = false,
}: SupplierQuoteAttachmentsProps) {
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);

  useEffect(() => {
    const fetchFileUrls = async () => {
      if (!attachments || attachments.length === 0) return;
      
      setIsLoadingUrls(true);
      
      try {
        const urls: Record<string, string> = {};
        
        for (const attachment of attachments) {
          const { data, error } = await supabase
            .storage
            .from('supplier-quote-attachments')
            .createSignedUrl(attachment.file_key, 60 * 60); // 1 hour expiry
            
          if (error) {
            console.error("Error getting URL for", attachment.file_name, error);
            continue;
          }
          
          if (data) {
            urls[attachment.id] = data.signedUrl;
          }
        }
        
        setFileUrls(urls);
      } catch (error) {
        console.error("Error fetching file URLs:", error);
      } finally {
        setIsLoadingUrls(false);
      }
    };
    
    fetchFileUrls();
  }, [attachments]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf':
        return <FileIcon className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileIcon className="h-8 w-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileIcon className="h-8 w-8 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileIcon className="h-8 w-8 text-purple-500" />;
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return 'Unknown size';
    
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  if (isLoading || isLoadingUrls) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading attachments...</p>
        </CardContent>
      </Card>
    );
  }

  if (!attachments || attachments.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No attachments for this quote</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Attachments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-start bg-muted/30 p-3 rounded-md border">
              <div className="mr-4">{getFileIcon(attachment.file_name)}</div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{attachment.file_name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(attachment.file_size)}
                  {attachment.uploaded_by && ` • Uploaded by ${attachment.uploaded_by}`}
                </p>
              </div>
              <div className="flex space-x-2">
                {fileUrls[attachment.id] && (
                  <>
                    <Button variant="outline" size="icon" asChild>
                      <a href={fileUrls[attachment.id]} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href={fileUrls[attachment.id]} download={attachment.file_name}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
