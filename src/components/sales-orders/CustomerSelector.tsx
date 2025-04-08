
import { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { Combobox } from "@/components/ui/combobox";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";

interface CustomerSelectorProps {
  control: Control<any>;
  name?: string;
}

export function CustomerSelector({
  control,
  name = "customerId"
}: CustomerSelectorProps) {
  const { customers, isLoadingCustomers } = useCustomers();
  
  const customerOptions = customers.map(customer => ({
    label: customer.customer_name,
    value: customer.id
  }));

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Customer</FormLabel>
          <FormControl>
            <Combobox
              items={customerOptions}
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Select a customer"
              searchPlaceholder="Search customers..."
              emptyMessage="No customers found."
              disabled={isLoadingCustomers}
              isLoading={isLoadingCustomers}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
