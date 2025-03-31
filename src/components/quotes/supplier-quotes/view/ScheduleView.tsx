
import { SupplierQuote } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";

interface ScheduleViewProps {
  quote: SupplierQuote;
}

export function ScheduleView({ quote }: ScheduleViewProps) {
  // Check if schedule exists
  const hasSchedule = quote.production_schedule && 
                     Object.keys(quote.production_schedule).length > 0;
  
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
              <TableHead>Step</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(quote.production_schedule).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell>{key.replace(/_/g, ' ')}</TableCell>
                <TableCell>{value || 'Not specified'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
