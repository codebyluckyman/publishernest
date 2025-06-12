
import React, { useState } from "react";
import { PublishingProgramList } from "@/components/publishing-programs/PublishingProgramList";
import { CreateProgramDialog } from "@/components/publishing-programs/CreateProgramDialog";
import type { PublishingProgram } from "@/types/publishingProgram";

const PublishingProgram = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<PublishingProgram | null>(null);

  const handleViewProgram = (program: PublishingProgram) => {
    setSelectedProgram(program);
    // COMPLETEED: Navigate to program detail view
    // console.log('View program:', program);
  };

  return (
    <div className="space-y-8">
    {/* Removed H1 and descripiton from page. Do not re-insert! */}

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
