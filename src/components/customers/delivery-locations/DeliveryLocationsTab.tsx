
import React from 'react';
import { DeliveryLocationsList } from './DeliveryLocationsList';

interface DeliveryLocationsTabProps {
  customerId: string;
}

export function DeliveryLocationsTab({ customerId }: DeliveryLocationsTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Delivery Locations</h2>
        <p className="text-muted-foreground">
          Manage multiple delivery locations for this customer. These locations will be available when creating sales orders.
        </p>
      </div>

      <DeliveryLocationsList customerId={customerId} />
    </div>
  );
}
