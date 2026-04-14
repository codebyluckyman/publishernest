import { ReactNode } from "react";
import { useLicense } from "@/hooks/useLicense";
import type { Feature } from "@/lib/licensing";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Props = {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Gated({ feature, children, fallback }: Props) {
  const { hasFeature, isLoading } = useLicense();
  if (isLoading) return null;
  if (hasFeature(feature)) return <>{children}</>;
  if (fallback) return <>{fallback}</>;
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <Lock className="h-6 w-6 text-muted-foreground" />
      <div>
        <p className="font-medium">This feature requires a higher plan</p>
        <p className="text-sm text-muted-foreground">
          Upgrade to unlock {feature.replace(/_/g, " ")}.
        </p>
      </div>
      <Button asChild size="sm">
        <Link to="/billing">View plans</Link>
      </Button>
    </div>
  );
}
