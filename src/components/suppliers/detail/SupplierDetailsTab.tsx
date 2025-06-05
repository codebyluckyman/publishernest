
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Supplier, SupplierFormValues } from "@/types/supplier";

interface SupplierDetailsTabProps {
  supplier: Supplier;
}

export function SupplierDetailsTab({ supplier }: SupplierDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<SupplierFormValues>({
    defaultValues: {
      supplier_name: supplier.supplier_name,
      contact_name: supplier.contact_name || "",
      contact_email: supplier.contact_email || "",
      contact_phone: supplier.contact_phone || "",
      address: supplier.address || "",
      website: supplier.website || "",
      notes: supplier.notes || "",
      status: supplier.status,
    },
  });

  const statusValue = watch("status");

  const updateSupplier = useMutation({
    mutationFn: async (data: SupplierFormValues) => {
      const { data: result, error } = await supabase
        .from("suppliers")
        .update(data)
        .eq("id", supplier.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (updatedSupplier) => {
      queryClient.setQueryData(["supplier", supplier.id], updatedSupplier);
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier updated successfully");
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update supplier: ${error.message}`);
    },
  });

  const onSubmit = (data: SupplierFormValues) => {
    updateSupplier.mutate(data);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Supplier Details</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={supplier.status === "active" ? "default" : "destructive"}>
            {supplier.status}
          </Badge>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={updateSupplier.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit(onSubmit)}
                disabled={updateSupplier.isPending || !isDirty}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_name">Supplier Name</Label>
              <Input
                id="supplier_name"
                {...register("supplier_name", { required: "Supplier name is required" })}
                disabled={!isEditing}
              />
              {errors.supplier_name && (
                <p className="text-sm text-red-600">{errors.supplier_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusValue}
                onValueChange={(value) => setValue("status", value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                {...register("contact_name")}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                {...register("contact_email")}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                {...register("contact_phone")}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register("website")}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register("address")}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              disabled={!isEditing}
              rows={3}
            />
          </div>
        </form>

        {supplier.created_at && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Created: {new Date(supplier.created_at).toLocaleDateString()}
            </p>
            {supplier.updated_at && (
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(supplier.updated_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
