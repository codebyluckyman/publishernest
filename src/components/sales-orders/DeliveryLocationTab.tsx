
import React from 'react';
import { CustomerDeliveryLocation } from '@/types/customerDeliveryLocation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, UserCheck, Mail, Phone, FileText } from 'lucide-react';

interface DeliveryLocationTabProps {
  deliveryLocation?: Partial<CustomerDeliveryLocation>;
  isLoading?: boolean;
}

export function DeliveryLocationTab({ deliveryLocation, isLoading }: DeliveryLocationTabProps) {
  if (isLoading) {
    return <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>;
  }

  if (!deliveryLocation) {
    return (
      <div className="p-6 text-center">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">No delivery location specified</h3>
        <p className="mt-1 text-sm text-gray-500">This sales order does not have a specific delivery location assigned.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            {deliveryLocation.location_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-medium text-sm">Address</h3>
            <p className="whitespace-pre-wrap">{deliveryLocation.address}</p>
            <p>
              {[
                deliveryLocation.city,
                deliveryLocation.state,
                deliveryLocation.postal_code,
                deliveryLocation.country
              ].filter(Boolean).join(', ')}
            </p>
          </div>
          
          {(deliveryLocation.contact_name || deliveryLocation.contact_email || deliveryLocation.contact_phone) && (
            <div className="space-y-2 border-t pt-4">
              <h3 className="font-medium text-sm">Contact Information</h3>
              {deliveryLocation.contact_name && (
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{deliveryLocation.contact_name}</span>
                </div>
              )}
              {deliveryLocation.contact_email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{deliveryLocation.contact_email}</span>
                </div>
              )}
              {deliveryLocation.contact_phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{deliveryLocation.contact_phone}</span>
                </div>
              )}
            </div>
          )}
          
          {deliveryLocation.notes && (
            <div className="space-y-1 border-t pt-4">
              <h3 className="font-medium text-sm">Notes</h3>
              <p className="whitespace-pre-wrap text-sm">
                <FileText className="h-4 w-4 inline mr-2 text-gray-500" />
                {deliveryLocation.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
