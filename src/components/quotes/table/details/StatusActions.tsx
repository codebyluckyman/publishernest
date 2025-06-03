import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ClockIcon, Loader2 } from "lucide-react";

interface StatusActionsProps {
  status: string;
  onStatusChange: (status: "approved" | "declined" | "pending") => void;
  isSubmitting: boolean;
}

export function StatusActions({
  status,
  onStatusChange,
  isSubmitting,
}: StatusActionsProps) {
  const [selectedButton, setSelectedButton] = useState<
    "approved" | "declined" | "pending"
  >();
  const handleClick = (type: "approved" | "declined" | "pending") => {
    setSelectedButton(type);
    onStatusChange(type);
  };
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Actions</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={status === "approved" ? "default" : "outline"}
          onClick={() => handleClick("approved")}
          className="flex-1"
          disabled={isSubmitting}
        >
          {selectedButton === "approved" && isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-1" />
          )}
          Mark Active
        </Button>
        <Button
          variant={status === "declined" ? "destructive" : "outline"}
          onClick={() => handleClick("declined")}
          className="flex-1"
          disabled={isSubmitting}
        >
          {selectedButton === "declined" && isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4 mr-1" />
          )}
          Mark Inactive
        </Button>
        <Button
          variant={status === "pending" ? "secondary" : "outline"}
          onClick={() => handleClick("pending")}
          className="flex-1"
          disabled={isSubmitting}
        >
          {selectedButton === "pending" && isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ClockIcon className="h-4 w-4 mr-1" />
          )}
          Pending
        </Button>
      </div>
    </div>
  );
}
