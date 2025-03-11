
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Supplier, SupplierFormValues } from "@/types/supplier";
import { toast } from "sonner";
import { Organization } from "@/types/organization";

export const useSuppliersApi = (
  currentOrganization: Organization | null,
  options?: {
    searchQuery?: string;
    filters?: {
      status: string | null;
    };
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    refreshTrigger?: number;
  }
) => {
  const queryClient = useQueryClient();
  const {
    searchQuery = "",
    filters = { status: null },
    sortField = "supplier_name",
    sortDirection = "asc",
    refreshTrigger = 0,
  } = options || {};

  // Fetch all suppliers
  const {
    data: suppliers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "suppliers",
      currentOrganization?.id,
      searchQuery,
      filters,
      sortField,
      sortDirection,
      refreshTrigger,
    ],
    queryFn: async () => {
      if (!currentOrganization) return [];

      let query = supabase
        .from("suppliers")
        .select("*")
        .eq("organization_id", currentOrganization.id);

      if (searchQuery) {
        query = query.ilike("supplier_name", `%${searchQuery}%`);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query.order(sortField, {
        ascending: sortDirection === "asc",
      });

      if (error) throw error;

      return data as Supplier[];
    },
    enabled: !!currentOrganization,
  });

  // Fetch a single supplier by ID
  const getSupplier = async (id: string): Promise<Supplier | null> => {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data as Supplier;
  };

  // Create a new supplier
  const createSupplier = useMutation({
    mutationFn: async (newSupplier: SupplierFormValues) => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }

      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          ...newSupplier,
          organization_id: currentOrganization.id,
        })
        .select()
        .single();

      if (error) throw error;

      return data as Supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create supplier: ${error.message}`);
    },
  });

  // Update an existing supplier
  const updateSupplier = useMutation({
    mutationFn: async ({
      id,
      ...updateData
    }: SupplierFormValues & { id: string }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data as Supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update supplier: ${error.message}`);
    },
  });

  // Delete a supplier
  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);

      if (error) throw error;

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete supplier: ${error.message}`);
    },
  });

  return {
    suppliers,
    isLoading,
    error,
    refetch,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};
