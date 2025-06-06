
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Target, DollarSign, Book } from "lucide-react";
import { useProgramTitles } from "@/hooks/usePublishingPrograms";
import { AddTitleDialog } from "./AddTitleDialog";
import { format } from "date-fns";

interface ProgramTitlesSectionProps {
  programFormatId: string;
}

export function ProgramTitlesSection({ programFormatId }: ProgramTitlesSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data: titles, isLoading } = useProgramTitles(programFormatId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concept': return 'bg-gray-100 text-gray-800';
      case 'editorial': return 'bg-orange-100 text-orange-800';
      case 'design': return 'bg-purple-100 text-purple-800';
      case 'production': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4 border-t pt-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Titles</h4>
          <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Add Title
          </Button>
        </div>

        {titles && titles.length > 0 ? (
          <div className="space-y-3">
            {titles.map((title) => (
              <div key={title.id} className="bg-gray-50 p-3 rounded border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium text-sm">{title.working_title}</h5>
                    {title.product?.title && title.product.title !== title.working_title && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Book className="h-3 w-3" />
                        Linked to: {title.product.title}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(title.status)} variant="secondary">
                    {title.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600">
                  {title.target_isbn && (
                    <span>ISBN: {title.target_isbn}</span>
                  )}
                  {title.planned_pub_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(title.planned_pub_date), 'MMM yyyy')}</span>
                    </div>
                  )}
                  {title.target_quantity && (
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{title.target_quantity.toLocaleString()}</span>
                    </div>
                  )}
                  {title.estimated_cost && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${title.estimated_cost.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {title.content_brief && (
                  <p className="text-xs text-gray-700 mt-2 bg-white p-2 rounded">
                    {title.content_brief}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            <p>No titles added for this format yet.</p>
          </div>
        )}
      </div>

      <AddTitleDialog 
        programFormatId={programFormatId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
