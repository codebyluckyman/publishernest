
import { FormatBadge } from "../../FormatBadge";
import { Format } from "@/types/quoteRequest";

interface FormatsDisplayProps {
  formats: Format[] | undefined;
}

export function FormatsDisplay({ formats }: FormatsDisplayProps) {
  if (!formats || formats.length === 0) {
    return <span className="text-muted-foreground text-sm">None</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {formats.map((format) => (
        <FormatBadge key={format.id} format={format} />
      ))}
    </div>
  );
}
