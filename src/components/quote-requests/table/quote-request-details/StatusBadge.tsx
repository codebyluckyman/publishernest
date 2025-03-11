
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    case "open":
      return <Badge variant="default">Open</Badge>;
    case "closed":
      return <Badge variant="secondary">Closed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
