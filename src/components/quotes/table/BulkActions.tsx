
import { Button } from "@/components/ui/button";
import {
  Trash,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BulkActionsProps {
  selectedCount: number;
  onApprove: () => void;
  onDecline: () => void;
  onMarkPending: () => void;
  onDelete: () => void;
  onUpdateDueDate: () => void;
  onClearSelection: () => void;
}

export function BulkActions({
  selectedCount,
  onApprove,
  onDecline,
  onMarkPending,
  onDelete,
  onUpdateDueDate,
  onClearSelection,
}: BulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

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
              onClick={onApprove}
              className="text-green-600"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Approve selected quote requests</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDecline}
              className="text-red-600"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Decline selected quote requests</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkPending}
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
              onClick={onUpdateDueDate}
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
              onClick={onDelete}
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
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
          >
            Clear Selection
          </Button>
        </div>
      </TooltipProvider>
    </div>
  );
}
