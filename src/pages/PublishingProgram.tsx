
import React, { useState } from "react";
import { PublishingProgramList } from "@/components/publishing-programs/PublishingProgramList";
import { CreateProgramDialog } from "@/components/publishing-programs/CreateProgramDialog";
import type { PublishingProgram } from "@/types/publishingProgram";

const PublishingProgram = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<PublishingProgram | null>(null);

  const handleViewProgram = (program: PublishingProgram) => {
    setSelectedProgram(program);
    // TODO: Navigate to program detail view
    console.log('View program:', program);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Publishing Program</h1>
        <p className="text-gray-600">Manage your publishing programs, formats, and title planning</p>
      </div>

      <PublishingProgramList 
        onCreateProgram={() => setShowCreateDialog(true)}
        onViewProgram={handleViewProgram}
      />

      <CreateProgramDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

export default PublishingProgram;
