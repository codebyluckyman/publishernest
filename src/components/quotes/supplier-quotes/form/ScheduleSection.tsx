
import { useState, useEffect } from "react";
import { Control } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/hooks/useOrganization";
import { OrganizationProductionStep } from "@/types/organization";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { fetchProductionSteps } from "@/api/organizations/productionSteps";

interface ScheduleSectionProps {
  control: Control<SupplierQuoteFormValues>;
}

export function ScheduleSection({ control }: ScheduleSectionProps) {
  const { currentOrganization } = useOrganization();
  const [productionSteps, setProductionSteps] = useState<OrganizationProductionStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProductionSteps = async () => {
      if (!currentOrganization?.id) return;
      
      setLoading(true);
      try {
        const steps = await fetchProductionSteps(currentOrganization.id);
        setProductionSteps(steps);
      } catch (error) {
        console.error("Error fetching production steps:", error);
      } finally {
        setLoading(false);
      }
    };

    getProductionSteps();
  }, [currentOrganization]);

  if (loading) {
    return <div className="py-4 text-center">Loading production steps...</div>;
  }

  if (productionSteps.length === 0) {
    return (
      <div className="text-center py-6">
        <h3 className="text-lg font-medium mb-2">No Production Steps Found</h3>
        <p className="text-muted-foreground">
          There are no production steps defined for this organization. 
          <br />
          Please add production steps in the Organization Settings to create a schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Production Schedule</h3>
        <p className="text-muted-foreground">
          Please provide estimated dates for each production step.
        </p>
      </div>

      <div className="space-y-4">
        {productionSteps
          .sort((a, b) => a.order_number - b.order_number)
          .map((step) => (
            <div key={step.id} className="grid grid-cols-[1fr,auto] gap-4 items-center border-b pb-3">
              <div>
                <h4 className="font-medium">{step.step_name}</h4>
                {step.description && (
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                )}
                {step.estimated_days && (
                  <p className="text-xs text-muted-foreground">
                    Estimated time: {step.estimated_days} days
                  </p>
                )}
              </div>
              <FormField
                control={control}
                name={`production_schedule.${step.id}`}
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-0">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[180px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString())}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
