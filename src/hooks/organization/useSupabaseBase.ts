
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSupabaseBase = (userId: string | undefined) => {
  const handleError = (error: any, message: string) => {
    console.error(`${message}:`, error);
    toast.error(message);
    throw error;
  };

  return {
    supabase,
    userId,
    handleError
  };
};
