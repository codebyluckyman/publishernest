
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Target, DollarSign } from "lucide-react";
import { useProgramFormats } from "@/hooks/usePublishingPrograms";
import { AddFormatDialog } from "./AddFormatDialog";
import { ProgramTitlesSection } from "./ProgramTitlesSection";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ProgramFormatsSectionProps {
  programId: string;
}

export function ProgramFormatsSection({ programId }: ProgramFormatsSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data: programFormats, isLoading } = useProgramFormats(programId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concept': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Program Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Program Formats</CardTitle>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Format
          </Button>
        </CardHeader>
        <CardContent>
          {programFormats && programFormats.length > 0 ? (
            <div className="space-y-6">
              {programFormats.map((programFormat) => (
                <div key={programFormat.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {programFormat.format?.format_name || 'Unknown Format'}
                      </h3>
                    </div>
                    <Badge className={getStatusColor(programFormat.status)}>
                      {programFormat.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    {programFormat.target_quantity && (
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{programFormat.target_quantity.toLocaleString()} copies</span>
                      </div>
                    )}
                    {programFormat.budget_allocation && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${programFormat.budget_allocation.toLocaleString()}</span>
                      </div>
                    )}
                    {programFormat.timeline_start && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(programFormat.timeline_start), 'MMM yyyy')}
                          {programFormat.timeline_end && 
                            ` - ${format(new Date(programFormat.timeline_end), 'MMM yyyy')}`
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  {programFormat.notes && (
                    <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded">
                      {programFormat.notes}
                    </p>
                  )}

                  <ProgramTitlesSection programFormatId={programFormat.id} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No formats added to this program yet.</p>
              <p className="text-sm mt-2">Click "Add Format" to start planning your publications.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddFormatDialog 
        programId={programId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
