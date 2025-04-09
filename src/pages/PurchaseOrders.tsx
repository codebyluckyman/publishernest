
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const { purchaseOrders, isLoadingPurchaseOrders } = usePurchaseOrders();
  
  const handleCreatePurchaseOrder = () => {
    toast({
      title: "Feature Coming Soon",
      description: "The Purchase Order creation feature is currently under development.",
      duration: 3000
    });
    
    // Still navigate to the placeholder page
    navigate("/create-purchase-order");
  };

  const columns = [
    {
      accessorKey: "po_number",
      header: "PO Number",
      cell: ({ row }) => (
        <Button 
          variant="link" 
          className="p-0 h-auto font-medium text-primary"
          onClick={() => navigate(`/purchase-orders/${row.original.id}`)}
        >
          {row.original.po_number}
        </Button>
      )
    },
    {
      accessorKey: "supplier.supplier_name",
      header: "Supplier",
    },
    {
      accessorKey: "issue_date",
      header: "Issue Date",
      cell: ({ row }) => row.original.issue_date ? new Date(row.original.issue_date).toLocaleDateString() : "—"
    },
    {
      accessorKey: "delivery_date",
      header: "Delivery Date",
      cell: ({ row }) => row.original.delivery_date ? new Date(row.original.delivery_date).toLocaleDateString() : "—"
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      cell: ({ row }) => {
        if (!row.original.total_amount) return "—";
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: row.original.currency || 'USD'
        }).format(row.original.total_amount);
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const getStatusColor = () => {
          switch (status) {
            case 'draft': return "bg-gray-200 text-gray-800";
            case 'pending_approval': return "bg-yellow-100 text-yellow-800";
            case 'approved': return "bg-green-100 text-green-800";
            case 'fulfilled': return "bg-blue-100 text-blue-800";
            case 'cancelled': return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
          }
        };
        
        return (
          <Badge className={getStatusColor()}>
            {status?.replace('_', ' ')}
          </Badge>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/purchase-orders/${row.original.id}`)}
        >
          <FileText className="h-4 w-4" />
          <span className="sr-only">View</span>
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage your purchase orders and supplier relationships</p>
        </div>
        <Button onClick={handleCreatePurchaseOrder}>
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={purchaseOrders || []}
        isLoading={isLoadingPurchaseOrders}
        filterColumn="po_number"
        filterPlaceholder="Search by PO number..."
      />
    </div>
  );
};

export default PurchaseOrders;
