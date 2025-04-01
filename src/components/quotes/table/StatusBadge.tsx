
import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Draft</Badge>;
    case "submitted":
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Submitted</Badge>;
    case "approved":
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Approved</Badge>;
    case "rejected":
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Rejected</Badge>;
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
    case "active":
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Active</Badge>;
    case "declined":
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Inactive</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
