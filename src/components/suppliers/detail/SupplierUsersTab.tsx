
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AddSupplierUserDialog } from "./AddSupplierUserDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SupplierUser {
  id: string;
  supplier_id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface SupplierUsersTabProps {
  supplierId: string;
}

export function SupplierUsersTab({ supplierId }: SupplierUsersTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SupplierUser | null>(null);
  const queryClient = useQueryClient();

  const { data: supplierUsers, isLoading } = useQuery({
    queryKey: ["supplier-users", supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_users")
        .select(`
          *,
          profiles (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq("supplier_id", supplierId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupplierUser[];
    },
  });

  const deleteSupplierUser = useMutation({
    mutationFn: async (userSupplierRelationId: string) => {
      const { error } = await supabase
        .from("supplier_users")
        .delete()
        .eq("id", userSupplierRelationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-users", supplierId] });
      toast.success("User removed from supplier");
      setUserToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove user: ${error.message}`);
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userSupplierRelationId, newStatus }: { userSupplierRelationId: string; newStatus: string }) => {
      const { error } = await supabase
        .from("supplier_users")
        .update({ status: newStatus })
        .eq("id", userSupplierRelationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-users", supplierId] });
      toast.success("User status updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user status: ${error.message}`);
    },
  });

  const handleDeleteUser = (user: SupplierUser) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteSupplierUser.mutate(userToDelete.id);
    }
  };

  const handleToggleStatus = (user: SupplierUser) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    toggleUserStatus.mutate({
      userSupplierRelationId: user.id,
      newStatus,
    });
  };

  const getUserDisplayName = (user: SupplierUser) => {
    if (user.profiles?.first_name || user.profiles?.last_name) {
      return `${user.profiles.first_name || ""} ${user.profiles.last_name || ""}`.trim();
    }
    return user.profiles?.email || "Unknown User";
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Supplier Users</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : supplierUsers && supplierUsers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {getUserDisplayName(user)}
                      </TableCell>
                      <TableCell>{user.profiles?.email || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(user)}
                            title={user.status === "active" ? "Deactivate user" : "Activate user"}
                          >
                            {user.status === "active" ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user)}
                            title="Remove user from supplier"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No users assigned to this supplier yet.</p>
              <p className="text-sm mt-2">Click "Add User" to assign users to this supplier.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddSupplierUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        supplierId={supplierId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["supplier-users", supplierId] });
        }}
      />

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User from Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToDelete ? getUserDisplayName(userToDelete) : ""} from this supplier? 
              They will no longer have access to supplier-related functions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
