import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLicense } from "@/hooks/useLicense";

export default function CheckoutResult({ status }: { status: "success" | "cancel" }) {
  const [params] = useSearchParams();
  const { refetch } = useLicense();

  useEffect(() => {
    if (status === "success") {
      // Give the webhook a moment, then refresh license state.
      const t = setTimeout(() => refetch(), 1500);
      return () => clearTimeout(t);
    }
  }, [status, refetch]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      {status === "success" ? (
        <>
          <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
          <h1 className="mt-6 text-3xl font-semibold">You're in.</h1>
          <p className="mt-2 text-muted-foreground">
            Your subscription is active. We're finalizing your account — this can take a few seconds.
          </p>
          <Button asChild className="mt-8">
            <Link to="/">Go to dashboard</Link>
          </Button>
        </>
      ) : (
        <>
          <XCircle className="mx-auto h-14 w-14 text-muted-foreground" />
          <h1 className="mt-6 text-3xl font-semibold">Checkout cancelled</h1>
          <p className="mt-2 text-muted-foreground">
            No charge was made. You can restart checkout any time.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/pricing">Back to pricing</Link>
            </Button>
            <Button asChild>
              <Link to="/">Go home</Link>
            </Button>
          </div>
        </>
      )}
      {params.get("session_id") && (
        <p className="mt-6 text-xs text-muted-foreground">
          Ref: {params.get("session_id")}
        </p>
      )}
    </div>
  );
}
