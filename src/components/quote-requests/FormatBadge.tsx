
import { Badge } from "@/components/ui/badge";
import { Format } from "@/types/quoteRequest";

interface FormatBadgeProps {
  format: Format;
}

export function FormatBadge({ format }: FormatBadgeProps) {
  return (
    <Badge variant="outline" className="mr-1 mb-1">
      {format.format_name}
    </Badge>
  );
}
