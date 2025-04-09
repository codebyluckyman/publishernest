
import { toast as shadcnToast } from "@/hooks/use-toast";

// Create a simpler API that mimics Sonner's while using Shadcn/ui under the hood
export const toast = {
  success: (message: string) => {
    shadcnToast({
      title: "Success",
      description: message,
      variant: "default",
    });
  },
  error: (message: string) => {
    shadcnToast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },
  warning: (message: string) => {
    shadcnToast({
      title: "Warning",
      description: message,
    });
  },
  info: (message: string) => {
    shadcnToast({
      title: "Info",
      description: message,
    });
  }
};
