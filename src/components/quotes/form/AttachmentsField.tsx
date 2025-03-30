
import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { Upload, File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

interface FilePreview {
  file: File;
  preview: string;
  id: string;
}

export function AttachmentsField() {
  const form = useFormContext();
  const [files, setFiles] = useState<FilePreview[]>([]);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${file.name}`
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Store files in form data for later upload
    form.setValue('attachments', [...(form.getValues('attachments') || []), ...acceptedFiles]);
  }, [form]);

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

  const removeFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove) {
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(fileToRemove.preview);
      
      // Remove from preview array
      const updatedFiles = files.filter(f => f.id !== id);
      setFiles(updatedFiles);
      
      // Remove from form value
      const currentAttachments = form.getValues('attachments') || [];
      const updatedAttachments = currentAttachments.filter((file: File) => 
        file.name !== fileToRemove.file.name || file.size !== fileToRemove.file.size
      );
      form.setValue('attachments', updatedAttachments);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  return (
    <FormField
      name="attachments"
      render={() => (
        <FormItem className="space-y-3">
          <FormLabel className="text-base font-medium">Attachments</FormLabel>
          
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
          
          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Selected Files</h4>
              <div className="grid gap-3">
                {files.map((file) => (
                  <Card key={file.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <File className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{file.file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {Math.round(file.file.size / 1024)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
