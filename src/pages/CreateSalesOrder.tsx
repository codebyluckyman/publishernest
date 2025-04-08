
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesOrderForm } from '@/components/sales-orders/SalesOrderForm';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const CreateSalesOrder = () => {
  const navigate = useNavigate();
  const { createSalesOrder, isCreatingSalesOrder } = useSalesOrders();
  const { user } = useAuth();

  const handleSubmit = async (data: any) => {
    if (!user?.id) {
      toast.error('User information is missing. Please try logging in again.');
      return;
    }

    try {
      const result = await createSalesOrder({
        ...data,
        createdBy: user.id
      });
      
      toast.success('Sales order created successfully');
      navigate(`/sales-orders/${result.id}`);
    } catch (error) {
      console.error('Error creating sales order:', error);
      toast.error('Failed to create sales order');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Sales Order</h1>
        <p className="text-gray-500">Create a new sales order for a customer</p>
      </div>

      <SalesOrderForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateSalesOrder;
