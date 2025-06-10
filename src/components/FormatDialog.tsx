
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles } from "lucide-react";
import { FormatForm } from "./FormatForm";
import { useFormats } from "@/hooks/useFormats";
import { useOrganization } from "@/hooks/useOrganization";

interface FormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatId?: string | null;
  initialValues?: any;
  aiGenerated?: boolean;
  onSuccess?: () => void;
}

export function FormatDialog({ 
  open, 
  onOpenChange, 
  formatId, 
  initialValues,
  aiGenerated = false,
  onSuccess 
}: FormatDialogProps) {
  const { currentOrganization } = useOrganization();
  const { useFormatById } = useFormats();
  
  const { data: format, isLoading } = useFormatById(formatId);

  const handleSuccess = () => {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const isEditing = !!formatId;
  const title = isEditing ? "Edit Format" : "Create New Format";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {title}
              {aiGenerated && (
                <Badge variant="secondary" className="gap-1">
                  <Bot className="h-3 w-3" />
                  <Sparkles className="h-3 w-3" />
                  AI Generated
                </Badge>
              )}
            </DialogTitle>
          </div>
          {aiGenerated && (
            <p className="text-sm text-muted-foreground">
              This format has been pre-filled with AI-generated specifications. Please review and modify as needed.
            </p>
          )}
        </DialogHeader>

        {isLoading && isEditing ? (
          <div className="p-6 text-center">Loading format...</div>
        ) : (
          <FormatForm
            format={isEditing ? format : undefined}
            initialValues={initialValues}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
