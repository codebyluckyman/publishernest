
import { Control, useFormContext } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Supplier } from "@/types/supplier";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useOrganization } from "@/context/OrganizationContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [productionSteps, setProductionSteps] = useState<any[]>([]);
  const { setValue, getValues } = useFormContext<SupplierQuoteFormValues>();
  
  // Fetch production steps for the organization
  useEffect(() => {
    if (currentOrganization?.id) {
      const fetchProductionSteps = async () => {
        const { data, error } = await supabase
          .from("organization_production_steps")
          .select("*")
          .eq("organization_id", currentOrganization.id)
          .eq("is_active", true)
          .order("order_number", { ascending: true });
          
        if (error) {
          console.error("Error fetching production steps:", error);
        } else {
          setProductionSteps(data || []);
        }
      };
      
      fetchProductionSteps();
    }
  }, [currentOrganization?.id]);

  if (!scheduleRequested) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Production schedule not requested</AlertTitle>
        <AlertDescription>
          The publisher has not requested a production schedule for this quote.
        </AlertDescription>
      </Alert>
    );
  }

  if (productionSteps.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No production steps defined</AlertTitle>
        <AlertDescription>
          No production steps have been defined for this organization. The publisher needs to configure production steps before you can provide a schedule.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Production Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Please provide estimated dates for each production step:
        </p>
        
        <div className="space-y-4">
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
                      value={field.value ? parseISO(field.value) : undefined}
                      onChange={(date) => {
                        const value = date ? format(date, 'yyyy-MM-dd') : null;
                        setValue(`production_schedule.${step.id}`, value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
