
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PurchaseOrdersTable } from '@/components/purchase-orders/PurchaseOrdersTable';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useOrganization } from '@/context/OrganizationContext';
import { Plus } from 'lucide-react';

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [status, setStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { usePurchaseOrdersList } = usePurchaseOrders();
  
  const { data: purchaseOrders, isLoading } = usePurchaseOrdersList(
    status || undefined,
    undefined,
    undefined,
    searchQuery || undefined
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
        <Button onClick={() => navigate('/purchase-orders/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Purchase Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            View and manage purchase orders for your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search purchase orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <PurchaseOrdersTable 
            purchaseOrders={purchaseOrders || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
