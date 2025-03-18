
import { useState } from "react";
import { useOrganization } from "@/context/OrganizationContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Key, Copy, Trash2, Plus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type APIKey = {
  id: string;
  name: string;
  api_key: string;
  created_at: string;
  last_used_at: string | null;
}

export function APIKeysList() {
  const { currentOrganization } = useOrganization();
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  
  const { data: apiKeys, isLoading, refetch } = useQuery({
    queryKey: ["apiKeys", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      
      const { data, error } = await supabase
        .from("api_keys")
        .select("id, name, api_key, created_at, last_used_at")
        .eq("organization_id", currentOrganization.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as APIKey[];
    },
    enabled: !!currentOrganization
  });
  
  const handleCreateKey = async () => {
    if (!currentOrganization || !newKeyName.trim()) return;
    
    try {
      // Generate a new API key using the database function
      const { data: apiKeyData, error: apiKeyError } = await supabase.rpc("generate_api_key");
      
      if (apiKeyError) throw apiKeyError;
      
      // Save the new API key to the database
      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          organization_id: currentOrganization.id,
          name: newKeyName.trim(),
          api_key: apiKeyData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select("api_key")
        .single();
      
      if (error) throw error;
      
      // Store the newly created key to display to the user
      setNewlyCreatedKey(data.api_key);
      setNewKeyName("");
      refetch();
      
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error("Failed to create API key");
    }
  };
  
  const handleDeleteKey = async (keyId: string) => {
    if (!currentOrganization) return;
    
    try {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyId);
      
      if (error) throw error;
      
      toast.success("API key deleted successfully");
      refetch();
      
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Failed to delete API key");
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard");
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage API keys for external integrations</CardDescription>
          </div>
          
          <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus size={16} />
                <span>New API Key</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new API Key</DialogTitle>
                <DialogDescription>
                  API keys allow external systems to update your inventory data. Keep your keys secure and never share them publicly.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">API Key Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Warehouse System"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>
                  Generate API Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Display newly created API key */}
          <Dialog open={!!newlyCreatedKey} onOpenChange={(open) => !open && setNewlyCreatedKey(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key size={18} />
                  <span>API Key Created</span>
                </DialogTitle>
                <DialogDescription>
                  Store this API key securely. For security reasons, it won't be displayed again.
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 p-3 bg-muted rounded-md font-mono text-sm overflow-auto break-all">
                {newlyCreatedKey}
              </div>
              
              <div className="flex justify-end mt-4 gap-2">
                <Button variant="outline" onClick={() => setNewlyCreatedKey(null)}>
                  Close
                </Button>
                <Button onClick={() => newlyCreatedKey && copyToClipboard(newlyCreatedKey)}>
                  <Copy size={16} className="mr-2" />
                  Copy
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">Loading API keys...</div>
        ) : !apiKeys || apiKeys.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <Key className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="font-medium text-lg mb-1">No API keys yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Create API keys to allow external systems to update your inventory.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>{formatDate(key.created_at)}</TableCell>
                  <TableCell>{key.last_used_at ? formatDate(key.last_used_at) : "Never"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(key.api_key)}>
                              <Copy size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy API Key</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Any systems using this API key will lose access.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteKey(key.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4 mt-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Info size={14} className="mr-1" />
          <span>API keys give access to update stock quantities</span>
        </div>
      </CardFooter>
    </Card>
  );
}
