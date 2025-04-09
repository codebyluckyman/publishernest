
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel,
  SelectTrigger, 
  SelectValue, 
} from "@/components/ui/select";
import { useCustomerDeliveryLocations } from '@/hooks/useCustomerDeliveryLocations';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MapPin, Loader2 } from 'lucide-react';

interface DeliveryLocationSelectorProps {
  customerId?: string;
  control: Control<any>;
  name?: string;
  label?: string;
  isRequired?: boolean;
  disabled?: boolean;
}

export function DeliveryLocationSelector({
  customerId,
  control,
  name = "deliveryLocationId",
  label = "Delivery Location",
  isRequired = false,
  disabled = false
}: DeliveryLocationSelectorProps) {
  const {
    deliveryLocations,
    isLoadingDeliveryLocations,
  } = useCustomerDeliveryLocations(customerId);

  // Find default location
  const defaultLocation = deliveryLocations?.find(location => location.is_default);
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <Select
            value={field.value || ""}
            onValueChange={field.onChange}
            disabled={disabled || !customerId || isLoadingDeliveryLocations}
          >
            <FormControl>
              <SelectTrigger>
                {isLoadingDeliveryLocations ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Loading locations...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select a delivery location" />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Delivery Locations</SelectLabel>
                {deliveryLocations?.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No locations available
                  </SelectItem>
                ) : (
                  deliveryLocations?.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {location.location_name}
                          {location.is_default && " (Default)"}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
