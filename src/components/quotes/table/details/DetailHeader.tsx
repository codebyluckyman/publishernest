
import React from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../StatusBadge";
import { FormatCountButton } from "../FormatCountButton";
import { QuoteRequest } from "@/types/quoteRequest";
import { FileEdit, RotateCcw, Printer } from "lucide-react";

interface DetailHeaderProps {
  request: QuoteRequest;
  onEdit?: () => void;
  onShowHistory: () => void;
  onPrint: () => void;
}

export function DetailHeader({ request, onEdit, onShowHistory, onPrint }: DetailHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-semibold">{request.title}</h2>
        <div className="flex items-center mt-2 space-x-2">
          <StatusBadge status={request.status} />
          {request.formats && request.formats.length > 0 && (
            <FormatCountButton formats={request.formats} />
          )}
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onPrint}
        >
          <Printer className="h-4 w-4 mr-1" />
          Print
        </Button>
        {onEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
          >
            <FileEdit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={onShowHistory}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          History
        </Button>
      </div>
    </div>
  );
}
