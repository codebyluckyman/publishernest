
import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonProps } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreateQuoteRequestFromFormatProps {
  formatId: string;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
  buttonText?: string;
  buttonIcon?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export function CreateQuoteRequestFromFormat({
  formatId,
  buttonVariant = "default",
  buttonSize = "default",
  buttonText = "Create Quote Request",
  buttonIcon = false,
  className = "",
  onSuccess
}: CreateQuoteRequestFromFormatProps) {
  const [isLoading, setIsLoading] = useState(false);

  const createQuoteRequestMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      
      // Create a basic quote request from the format
      const { data, error } = await supabase
        .from('quote_requests')
        .insert({
          format_id: formatId,
          status: 'draft',
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Quote request created");
      if (onSuccess) onSuccess();
      // Note: In a real implementation, you might navigate to the newly created quote request
      // or open it in a modal/dialog
    },
    onError: (error) => {
      toast.error(`Failed to create quote request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const handleClick = () => {
    createQuoteRequestMutation.mutate();
  };

  return (
    <Button
      variant={buttonVariant}
      size={buttonSize}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {buttonIcon && <FileText className="h-4 w-4 mr-2" />}
      {buttonText}
    </Button>
  );
}
