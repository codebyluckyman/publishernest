
import { useState, useEffect } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";
import { useOrganization } from "@/context/OrganizationContext";
import { fetchProductionSteps } from "@/api/organizations/productionSteps";
import { OrganizationProductionStep } from "@/types/organization";

interface ScheduleViewProps {
  quote: SupplierQuote;
}

interface ScheduleEntry {
  stepName: string;
  plannedDate: string;
  notes?: string;
}

export function ScheduleView({ quote }: ScheduleViewProps) {
  const { currentOrganization } = useOrganization();
  const [productionSteps, setProductionSteps] = useState<OrganizationProductionStep[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!currentOrganization?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch organization production steps
        const steps = await fetchProductionSteps(currentOrganization.id);
        setProductionSteps(steps);

        // Process production schedule data
        if (quote.production_schedule) {
          const entries: ScheduleEntry[] = [];

          // Check if it's an array (new format)
          if (Array.isArray(quote.production_schedule)) {
            for (const scheduleItem of quote.production_schedule) {
              const step = steps.find(s => s.id === scheduleItem.stepId);
              if (step && scheduleItem.plannedDate) {
                entries.push({
                  stepName: step.step_name,
                  plannedDate: scheduleItem.plannedDate,
                  notes: scheduleItem.notes
                });
              }
            }
          } 
          // Handle legacy object format
          else if (typeof quote.production_schedule === 'object') {
            for (const [stepId, plannedDate] of Object.entries(quote.production_schedule)) {
              if (plannedDate) {
                const step = steps.find(s => s.id === stepId);
                entries.push({
                  stepName: step?.step_name || stepId.replace(/_/g, ' '),
                  plannedDate: plannedDate,
                });
              }
            }
          }

          // Sort entries by planned date
          entries.sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());
          setScheduleEntries(entries);
        }
      } catch (error) {
        console.error("Error loading schedule data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [quote.production_schedule, currentOrganization?.id]);

  // Check if schedule exists
  const hasSchedule = scheduleEntries.length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Production Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading schedule...</p>
        </CardContent>
      </Card>
    );
  }

  // If no schedule
  if (!hasSchedule) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Production Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm italic">No production schedule provided</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Production Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Production Step</TableHead>
              <TableHead>Planned Date</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduleEntries.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{entry.stepName}</TableCell>
                <TableCell>
                  {new Date(entry.plannedDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{entry.notes || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
