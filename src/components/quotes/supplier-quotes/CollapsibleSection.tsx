
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  onOpenChange?: () => void;
  isEmpty?: boolean;
}

export function CollapsibleSection({ 
  title, 
  children, 
  onOpenChange, 
  isEmpty = false 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (onOpenChange) {
      onOpenChange();
    }
  };

  return (
    <Card>
      <CardHeader 
        className="py-3 cursor-pointer" 
        onClick={toggleOpen}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent>
          {isEmpty ? (
            <p className="text-muted-foreground text-sm italic">No information available</p>
          ) : (
            children
          )}
        </CardContent>
      )}
    </Card>
  );
}
