
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PublishingProgram } from "@/types/publishingProgram";
import { ProgramForm } from "../ProgramForm";

interface EditProgramDialogProps {
  program: PublishingProgram;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProgramDialog({ program, open, onOpenChange }: EditProgramDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Publishing Program</DialogTitle>
        </DialogHeader>
        <ProgramForm 
          program={program}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
