import { Button } from "@/components/ui/button";
import { Trash, CheckCircle, XCircle, RefreshCw, Calendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/alert-dialog-custom";

interface BulkActionsProps {
  selectedCount: number;
  onApprove: () => void;
  onDecline: () => void;
  onMarkPending: () => void;
  onDelete: () => void;
  onUpdateDueDate: () => void;
  onClearSelection: () => void;
}

type DialogType =
  | "approve"
  | "delete"
  | "decline"
  | "pending"
  | "dueDate"
  | null;

export function BulkActions({
  selectedCount,
  onApprove,
  onDecline,
  onMarkPending,
  onDelete,
  onUpdateDueDate,
  onClearSelection,
}: BulkActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>(null);

  const handleOpenDialog = (type: DialogType) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    switch (dialogType) {
      case "approve":
        onApprove();
        break;
      case "delete":
        onDelete();
        break;
      case "decline":
        onDecline();
        break;
      case "pending":
        onMarkPending();
        break;
      case "dueDate":
        onUpdateDueDate();
        break;
    }
    setDialogOpen(false);
  };

  // Dialog content based on type
  const getDialogContent = () => {
    switch (dialogType) {
      case "approve":
        return {
          title: "Confirm Mark as Active",
          description: `Are you sure you want to mark ${selectedCount} ${
            selectedCount === 1 ? "request" : "requests"
          } as active?`,
          confirmText: "Mark Active",
        };
      case "delete":
        return {
          title: "Confirm Deletion",
          description: `Are you sure you want to delete ${selectedCount} ${
            selectedCount === 1 ? "request" : "requests"
          }? This action cannot be undone and may affect related data.`,
          confirmText: "Delete",
        };
      case "decline":
        return {
          title: "Confirm Mark as Inactive",
          description: `Are you sure you want to mark ${selectedCount} ${
            selectedCount === 1 ? "request" : "requests"
          } as inactive?`,
          confirmText: "Mark Inactive",
        };
      case "pending":
        return {
          title: "Confirm Mark as Pending",
          description: `Are you sure you want to mark ${selectedCount} ${
            selectedCount === 1 ? "request" : "requests"
          } as pending?`,
          confirmText: "Mark Pending",
        };
      case "dueDate":
        return {
          title: "Update Due Date",
          description: `Are you sure you want to update the due date for ${selectedCount} ${
            selectedCount === 1 ? "request" : "requests"
          }?`,
          confirmText: "Update",
        };
      default:
        return {
          title: "",
          description: "",
          confirmText: "Confirm",
        };
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  const dialogContent = getDialogContent();

  return (
    <div className="bg-white border rounded-md shadow-sm p-2 flex items-center gap-2 mb-4">
      <span className="text-sm font-medium px-2">
        {selectedCount} {selectedCount === 1 ? "request" : "requests"} selected
      </span>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDialog("approve")}
              className="text-green-600"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Active
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark selected quote requests as active</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDialog("decline")}
              className="text-red-600"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Mark Inactive
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark selected quote requests as inactive</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDialog("pending")}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Mark Pending
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark selected quote requests as pending</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDialog("dueDate")}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Update Due Date
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Update due date for selected quote requests</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDialog("delete")}
              className="text-red-600"
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected quote requests</p>
          </TooltipContent>
        </Tooltip>

        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </div>
      </TooltipProvider>

      {/* Single Confirm Dialog that changes based on context */}
      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogContent.title}
        description={dialogContent.description}
        onConfirm={handleConfirm}
        confirmText={dialogContent.confirmText}
      />
    </div>
  );
}
