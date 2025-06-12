
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Supplier } from "@/types/supplier";
import { SupplierDetailsTab } from "@/components/suppliers/detail/SupplierDetailsTab";
import { SupplierUsersTab } from "@/components/suppliers/detail/SupplierUsersTab";
import { SupplierQuotesTab } from "@/components/suppliers/detail/SupplierQuotesTab";
import { SupplierPurchaseOrdersTab } from "@/components/suppliers/detail/SupplierPurchaseOrdersTab";

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: supplier, isLoading, error } = useQuery({
    queryKey: ["supplier", id],
    queryFn: async () => {
      if (!id) throw new Error("Supplier ID is required");
      
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Supplier;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/suppliers")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error ? "Failed to load supplier" : "Supplier not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/suppliers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Suppliers
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">{supplier.supplier_name}</h1>
          <p className="text-gray-600">Supplier Management</p>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <SupplierDetailsTab supplier={supplier} />
        </TabsContent>

        <TabsContent value="users">
          <SupplierUsersTab supplierId={supplier.id} />
        </TabsContent>

        <TabsContent value="quotes">
          <SupplierQuotesTab supplierId={supplier.id} />
        </TabsContent>

        <TabsContent value="purchase-orders">
          <SupplierPurchaseOrdersTab supplierId={supplier.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierDetail;
