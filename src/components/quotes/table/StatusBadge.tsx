
import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
    case "approved":
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Approved</Badge>;
    case "declined":
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Declined</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
