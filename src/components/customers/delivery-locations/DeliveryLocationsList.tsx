
import React, { useState } from 'react';
import { CustomerDeliveryLocation, CustomerDeliveryLocationFormValues } from '@/types/customerDeliveryLocation';
import { useCustomerDeliveryLocations } from '@/hooks/useCustomerDeliveryLocations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, Phone, Mail, User, Check, PenSquare, Trash2, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { DeliveryLocationDialog } from './DeliveryLocationDialog';
import { Skeleton } from '@/components/ui/skeleton';

interface DeliveryLocationsListProps {
  customerId: string;
}

export function DeliveryLocationsList({ customerId }: DeliveryLocationsListProps) {
  const {
    deliveryLocations,
    isLoadingDeliveryLocations,
    createDeliveryLocation,
    updateDeliveryLocation,
    deleteDeliveryLocation,
    isCreatingDeliveryLocation,
    isUpdatingDeliveryLocation,
    isDeletingDeliveryLocation,
  } = useCustomerDeliveryLocations(customerId);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<CustomerDeliveryLocation | null>(null);

  const handleAddLocation = (data: CustomerDeliveryLocationFormValues) => {
    createDeliveryLocation(data);
    setIsAddDialogOpen(false);
  };

  const handleEditLocation = (data: CustomerDeliveryLocationFormValues) => {
    if (selectedLocation) {
      updateDeliveryLocation({ id: selectedLocation.id, data });
      setIsEditDialogOpen(false);
      setSelectedLocation(null);
    }
  };

  const handleDeleteLocation = () => {
    if (selectedLocation) {
      deleteDeliveryLocation(selectedLocation.id);
      setIsDeleteDialogOpen(false);
      setSelectedLocation(null);
    }
  };

  const openEditDialog = (location: CustomerDeliveryLocation) => {
    setSelectedLocation(location);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (location: CustomerDeliveryLocation) => {
    setSelectedLocation(location);
    setIsDeleteDialogOpen(true);
  };

  if (isLoadingDeliveryLocations) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Delivery Locations</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {deliveryLocations.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No delivery locations</h3>
            <p className="text-muted-foreground mb-4">
              Add delivery locations to make it easier to specify shipping details for sales orders.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveryLocations.map((location) => (
            <Card key={location.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {location.location_name}
                      {location.is_default && (
                        <Badge variant="secondary" className="ml-2">
                          <Check className="h-3 w-3 mr-1" /> Default
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openEditDialog(location)}
                    >
                      <PenSquare className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openDeleteDialog(location)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="text-sm">
                      <p>{location.address}</p>
                      {(location.city || location.state || location.postal_code) && (
                        <p>
                          {[
                            location.city, 
                            location.state, 
                            location.postal_code
                          ].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {location.country && <p>{location.country}</p>}
                    </div>
                  </div>
                  
                  {(location.contact_name || location.contact_email || location.contact_phone) && (
                    <div className="border-t pt-2 mt-2 space-y-2">
                      {location.contact_name && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{location.contact_name}</span>
                        </div>
                      )}
                      {location.contact_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${location.contact_email}`} className="text-sm text-blue-600 hover:underline">
                            {location.contact_email}
                          </a>
                        </div>
                      )}
                      {location.contact_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{location.contact_phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              {location.notes && (
                <CardFooter className="pt-0 border-t">
                  <p className="text-sm text-muted-foreground">{location.notes}</p>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      <DeliveryLocationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add Delivery Location"
        description="Enter the details for the new delivery location."
        onSubmit={handleAddLocation}
        isSubmitting={isCreatingDeliveryLocation}
      />

      {selectedLocation && (
        <>
          <DeliveryLocationDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            title="Edit Delivery Location"
            defaultValues={selectedLocation}
            onSubmit={handleEditLocation}
            isSubmitting={isUpdatingDeliveryLocation}
            isEditMode={true}
          />

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the delivery location "{selectedLocation.location_name}". 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteLocation}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
