
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePublishingPrograms } from "@/hooks/usePublishingPrograms";
import { ProgramFormatsSection } from "@/components/publishing-programs/detail/ProgramFormatsSection";
import { EditProgramDialog } from "@/components/publishing-programs/detail/EditProgramDialog";
import { format } from "date-fns";

const ProgramDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { programs, isLoading } = usePublishingPrograms();
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const program = programs.find(p => p.id === id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/publishing-program')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Button>
        </div>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Program Not Found</h2>
          <p className="text-gray-600">The publishing program you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/publishing-program')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Programs
        </Button>
      </div>

      {/* Compact program info header */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(program.status)}>
              {program.status}
            </Badge>
            {program.program_year && (
              <span className="text-sm text-gray-500">({program.program_year})</span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
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
        </div>
        
        <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Program
        </Button>
      </div>

      <ProgramFormatsSection programId={program.id} />

      <EditProgramDialog 
        program={program}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </div>
  );
};

export default ProgramDetail;
