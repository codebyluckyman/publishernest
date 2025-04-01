
import { useState, useEffect } from "react";
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { Supplier } from "@/types/supplier";
import { useOrganization } from "@/context/OrganizationContext";
import { fetchProductionSteps } from "@/api/organizations/productionSteps";
import { OrganizationProductionStep } from "@/types/organization";

interface ProductionScheduleSectionProps {
  control: Control<SupplierQuoteFormValues>;
  scheduleRequested: boolean;
  selectedSupplier: Supplier | null;
}

export function ProductionScheduleSection({
  control,
  scheduleRequested,
  selectedSupplier
}: ProductionScheduleSectionProps) {
  const { currentOrganization } = useOrganization();
  const [productionSteps, setProductionSteps] = useState<OrganizationProductionStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch production steps when the component mounts
  useEffect(() => {
    const getProductionSteps = async () => {
      if (!currentOrganization?.id) return;
      
      setIsLoading(true);
      try {
        const steps = await fetchProductionSteps(currentOrganization.id);
        setProductionSteps(steps);
      } catch (error) {
        console.error("Error fetching production steps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (scheduleRequested) {
      getProductionSteps();
    }
  }, [currentOrganization, scheduleRequested]);
  
  // If schedule not requested, show a message instead
  if (!scheduleRequested) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Production Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Production schedule wasn't requested for this quote.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // If loading production steps, show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Production Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading production steps...</p>
        </CardContent>
      </Card>
    );
  }
  
  // If no production steps defined, show guidance
  if (!productionSteps || productionSteps.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Production Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No production steps have been defined for your organization.
              Please define production steps in the Organization Settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Production Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Please provide the estimated dates for each production step.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {productionSteps.map((step) => (
            <FormField
              key={step.id}
              control={control}
              name={`production_schedule.${step.id}`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{step.step_name}</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      setDate={(date) => field.onChange(date ? date.toISOString().split('T')[0] : null)}
                    />
                  </FormControl>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  )}
                </FormItem>
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
