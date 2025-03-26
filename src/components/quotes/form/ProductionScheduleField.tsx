
import { useState, useEffect } from "react";
import { FormField, FormItem, FormControl, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, CalendarIcon, Clock } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { QuoteRequestFormValues } from "./schema";
import { useOrganization } from "@/hooks/useOrganization";
import { OrganizationProductionStep } from "@/types/organization";
import { fetchProductionSteps } from "@/api/organizations/productionSteps";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";

export function ProductionScheduleField() {
  const form = useFormContext<QuoteRequestFormValues>();
  const { currentOrganization } = useOrganization();
  const [productionSteps, setProductionSteps] = useState<OrganizationProductionStep[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Watch the production_schedule_requested field to conditionally display step selection
  const scheduleRequested = form.watch("production_schedule_requested");

  // Fetch production steps when the component mounts
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

    if (scheduleRequested) {
      getProductionSteps();
    }
  }, [currentOrganization, scheduleRequested]);

  return (
    <div className="bg-muted/30 p-4 rounded-md border border-border">
      <div className="flex items-start space-x-3">
        <Calendar className="h-5 w-5 text-primary mt-0.5" />
        <div className="space-y-4 w-full">
          <FormField
            control={form.control}
            name="production_schedule_requested"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-semibold">Request Production Schedule</FormLabel>
                  <FormDescription>
                    Ask the supplier to include a detailed production timeline with their quote.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {scheduleRequested && (
            <div className="mt-4 pl-6 border-l-2 border-muted">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" /> 
                Required Step Deadline
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Specify a critical production step and its required completion date.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Step Selection */}
                <FormField
                  control={form.control}
                  name="required_step_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Production Step</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a production step" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loading ? (
                            <SelectItem value="loading" disabled>Loading steps...</SelectItem>
                          ) : productionSteps.length === 0 ? (
                            <SelectItem value="none" disabled>No steps defined</SelectItem>
                          ) : (
                            productionSteps.map(step => (
                              <SelectItem key={step.id} value={step.id}>
                                {step.step_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Selection */}
                <FormField
                  control={form.control}
                  name="required_step_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Completion Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={!form.watch("required_step_id")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
