
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Calendar, DollarSign } from "lucide-react";
import { PublishingProgram } from "@/types/publishingProgram";
import { format } from "date-fns";
import { EditProgramDialog } from "./EditProgramDialog";

interface ProgramHeaderProps {
  program: PublishingProgram;
}

export function ProgramHeader({ program }: ProgramHeaderProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {program.name}
                {program.program_year && (
                  <span className="text-sm text-gray-500">({program.program_year})</span>
                )}
              </CardTitle>
              {program.description && (
                <p className="text-gray-600 mt-1">{program.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(program.status)}>
                {program.status}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            {program.target_budget && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: program.currency || 'USD',
                  }).format(program.target_budget)}
                </span>
              </div>
            )}
            {program.start_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(program.start_date), 'MMM yyyy')}
                  {program.end_date && ` - ${format(new Date(program.end_date), 'MMM yyyy')}`}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditProgramDialog 
        program={program}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}
