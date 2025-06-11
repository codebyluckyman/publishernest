
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, DollarSign, BookOpen } from "lucide-react";
import { usePublishingPrograms } from "@/hooks/usePublishingPrograms";
import { PublishingProgram } from "@/types/publishingProgram";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ProgramTag } from "./ProgramTag";

interface PublishingProgramListProps {
  onCreateProgram: () => void;
  onViewProgram: (program: PublishingProgram) => void;
}

export function PublishingProgramList({ onCreateProgram, onViewProgram }: PublishingProgramListProps) {
  const { programs, isLoading } = usePublishingPrograms();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewProgram = (program: PublishingProgram) => {
    navigate(`/publishing-programs/${program.id}`);
    onViewProgram(program);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={onCreateProgram}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Program
        </Button>
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Publishing Programs</h3>
            <p className="text-gray-600 text-center mb-4">
              Get started by creating your first publishing program to organize formats and titles.
            </p>
            <Button onClick={onCreateProgram}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Program
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {programs.map((program) => (
            <Card key={program.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewProgram(program)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {program.name}
                      {program.program_year && (
                        <span className="text-sm text-gray-500">({program.program_year})</span>
                      )}
                    </CardTitle>
                    {program.description && (
                      <p className="text-gray-600 mt-1">{program.description}</p>
                    )}
                    {program.tags && program.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {program.tags.slice(0, 3).map((tag, index) => (
                          <ProgramTag key={index} tag={tag} />
                        ))}
                        {program.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{program.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge className={getStatusColor(program.status)}>
                    {program.status}
                  </Badge>
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
          ))}
        </div>
      )}
    </div>
  );
}
