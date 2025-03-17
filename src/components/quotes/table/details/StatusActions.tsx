
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ClockIcon } from "lucide-react";

interface StatusActionsProps {
  status: string;
  onStatusChange: (status: 'approved' | 'declined' | 'pending') => void;
}

export function StatusActions({ status, onStatusChange }: StatusActionsProps) {
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Actions</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={status === "approved" ? "default" : "outline"}
          onClick={() => onStatusChange("approved")}
          className="flex-1"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Mark Active
        </Button>
        <Button
          variant={status === "declined" ? "destructive" : "outline"}
          onClick={() => onStatusChange("declined")}
          className="flex-1"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Mark Inactive
        </Button>
        <Button
          variant={status === "pending" ? "secondary" : "outline"}
          onClick={() => onStatusChange("pending")}
          className="flex-1"
        >
          <ClockIcon className="h-4 w-4 mr-1" />
          Pending
        </Button>
      </div>
    </div>
  );
}
