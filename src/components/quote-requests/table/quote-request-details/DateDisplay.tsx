
import { format } from "date-fns";

interface DateDisplayProps {
  label: string;
  dateString: string | null;
}

export function DateDisplay({ label, dateString }: DateDisplayProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM d, yyyy");
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        {label}
      </h3>
      <p className="text-sm">{formatDate(dateString)}</p>
    </div>
  );
}
