
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerForm, CustomerFormValues } from '@/components/customers/CustomerForm';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/utils/toast-utils';

const CreateCustomer = () => {
  const navigate = useNavigate();
  const { createCustomer, isCreatingCustomer } = useCustomers();
  const { currentOrganization } = useOrganization();

  const handleSubmit = async (data: CustomerFormValues) => {
    if (!currentOrganization) {
      toast.error('No organization selected');
      return;
    }

    try {
      const customerData = {
        ...data,
        status: data.status || 'active',
      };

      createCustomer(customerData, {
        onSuccess: (result) => {
          toast.success('Customer created successfully');
          navigate(`/customers/${result.id}`);
        },
        onError: () => {
          toast.error('Failed to create customer');
        }
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Customer</h1>
        <p className="text-gray-500">Add a new customer to your organization</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Customer</CardTitle>
          <CardDescription>
            Enter the customer details below. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm 
            onSubmit={handleSubmit}
            isSubmitting={isCreatingCustomer}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCustomer;
