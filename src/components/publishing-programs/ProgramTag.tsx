
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProgramTag as ProgramTagType } from "@/types/publishingProgram";
import { X } from "lucide-react";

interface ProgramTagProps {
  tag: ProgramTagType;
  onRemove?: () => void;
  removable?: boolean;
}

const tagColorClasses = {
  green: "bg-green-100 text-green-800 border-green-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  red: "bg-red-100 text-red-800 border-red-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  pink: "bg-pink-100 text-pink-800 border-pink-200",
  gray: "bg-gray-100 text-gray-800 border-gray-200",
};

export function ProgramTag({ tag, onRemove, removable = false }: ProgramTagProps) {
  return (
    <Badge 
      variant="outline" 
      className={`${tagColorClasses[tag.color]} flex items-center gap-1 text-xs`}
    >
      {tag.name}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5"
          type="button"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}
