
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface AddSupplierUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string;
  onSuccess: () => void;
}

interface SupplierUserFormValues {
  user_email: string;
  status: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export function AddSupplierUserDialog({ open, onOpenChange, supplierId, onSuccess }: AddSupplierUserDialogProps) {
  const [searchEmail, setSearchEmail] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupplierUserFormValues>({
    defaultValues: {
      user_email: "",
      status: "active",
    },
  });

  const statusValue = watch("status");
  const userEmailValue = watch("user_email");

  // Search for users by email
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["search-users", searchEmail],
    queryFn: async () => {
      if (!searchEmail || searchEmail.length < 3) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .ilike("email", `%${searchEmail}%`)
        .limit(10);

      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: searchEmail.length >= 3,
  });

  const addSupplierUser = useMutation({
    mutationFn: async (data: SupplierUserFormValues) => {
      // First, find the user by email
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", data.user_email)
        .single();

      if (userError || !userProfile) {
        throw new Error("User not found with this email");
      }

      // Get supplier's organization to check if user is a member
      const { data: supplier, error: supplierError } = await supabase
        .from("suppliers")
        .select("organization_id")
        .eq("id", supplierId)
        .single();

      if (supplierError) {
        throw new Error("Failed to get supplier information");
      }

      // Check if user is a member of the supplier's organization
      const { data: orgMember, error: orgError } = await supabase
        .from("organization_members")
        .select("id")
        .eq("auth_user_id", userProfile.id)
        .eq("organization_id", supplier.organization_id)
        .single();

      if (orgError || !orgMember) {
        throw new Error("User must be a member of the organization before being added to a supplier");
      }

      // Check if user is already assigned to this supplier
      const { data: existingRelation, error: checkError } = await supabase
        .from("supplier_users")
        .select("id")
        .eq("supplier_id", supplierId)
        .eq("user_id", userProfile.id)
        .single();

      if (existingRelation) {
        throw new Error("User is already assigned to this supplier");
      }

      // Add the user to the supplier
      const { data: result, error } = await supabase
        .from("supplier_users")
        .insert({
          supplier_id: supplierId,
          user_id: userProfile.id,
          status: data.status,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("User added to supplier successfully");
      reset();
      setSearchEmail("");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add user: ${error.message}`);
    },
  });

  const onSubmit = (data: SupplierUserFormValues) => {
    addSupplierUser.mutate(data);
  };

  const handleUserSelect = (email: string) => {
    setValue("user_email", email);
    setSearchEmail("");
  };

  const handleClose = () => {
    reset();
    setSearchEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add User to Supplier</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_email">User Email</Label>
            <div className="relative">
              <Input
                id="user_email"
                type="email"
                placeholder="Search user by email..."
                value={userEmailValue || searchEmail}
                onChange={(e) => {
                  const value = e.target.value;
                  setValue("user_email", value);
                  setSearchEmail(value);
                }}
                {...register("user_email", { required: "User email is required" })}
              />
              
              {searchResults && searchResults.length > 0 && searchEmail && (
                <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                      onClick={() => handleUserSelect(user.email)}
                    >
                      <div className="font-medium">{user.email}</div>
                      {(user.first_name || user.last_name) && (
                        <div className="text-sm text-gray-600">
                          {`${user.first_name || ""} ${user.last_name || ""}`.trim()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.user_email && (
              <p className="text-sm text-red-600">{errors.user_email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={statusValue} onValueChange={(value) => setValue("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Note:</strong> Users must already be members of the organization before they can be added to a supplier. The user's role will be inherited from their organization membership.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={addSupplierUser.isPending}>
              {addSupplierUser.isPending ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
