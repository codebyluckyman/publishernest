
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface ProductEditContextProps {
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  updateProductField: (productId: string, field: string, value: any) => Promise<void>;
  isSaving: boolean;
  currentlySavingProduct: string | null;
  currentlySavingField: string | null;
  refreshData?: () => void;
  setRefreshCallback: (callback: () => void) => void;
}

const ProductEditContext = createContext<ProductEditContextProps | undefined>(undefined);

export function ProductEditProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentlySavingProduct, setCurrentlySavingProduct] = useState<string | null>(null);
  const [currentlySavingField, setCurrentlySavingField] = useState<string | null>(null);
  const [refreshCallback, setRefreshCallback] = useState<(() => void) | undefined>(undefined);
  const { toast } = useToast();

  // When edit mode changes from true to false, trigger a refresh
  useEffect(() => {
    if (!isEditMode && refreshCallback) {
      refreshCallback();
    }
  }, [isEditMode, refreshCallback]);

  const handleEditModeChange = (mode: boolean) => {
    setIsEditMode(mode);
    // If turning off edit mode, trigger the refresh callback
    if (!mode && refreshCallback) {
      refreshCallback();
    }
  };

  const updateProductField = async (productId: string, field: string, value: any) => {
    setIsSaving(true);
    setCurrentlySavingProduct(productId);
    setCurrentlySavingField(field);

    try {
      const { error } = await supabase
        .from("products")
        .update({ [field]: value })
        .eq("id", productId);

      if (error) {
        toast({
          title: "Error updating product",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Update successful",
        description: `Product ${field} updated successfully`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsSaving(false);
      setCurrentlySavingProduct(null);
      setCurrentlySavingField(null);
    }
  };

  const value = {
    isEditMode,
    setEditMode: handleEditModeChange,
    updateProductField,
    isSaving,
    currentlySavingProduct,
    currentlySavingField,
    refreshData: refreshCallback,
    setRefreshCallback,
  };

  return (
    <ProductEditContext.Provider value={value}>
      {children}
    </ProductEditContext.Provider>
  );
}

export const useProductEdit = () => {
  const context = useContext(ProductEditContext);
  if (context === undefined) {
    throw new Error('useProductEdit must be used within a ProductEditProvider');
  }
  return context;
};
