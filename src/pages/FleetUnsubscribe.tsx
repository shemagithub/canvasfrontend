import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/PageStatus";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { unsubscribeFleetAlerts } from "@/lib/api/subscribe";

function readToken(search: string): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return params.get("token")?.trim() ?? "";
}

export default function FleetUnsubscribe() {
  const token = useMemo(
    () => readToken(typeof window !== "undefined" ? window.location.search : ""),
    [],
  );
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setMessage("Missing unsubscribe token.");
      return;
    }
    unsubscribeFleetAlerts(token)
      .then((r) => {
        setOk(true);
        setMessage(r.message);
      })
      .catch((err: Error) => {
        setOk(false);
        setMessage(err.message || "Could not unsubscribe.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Updating preferences…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-page pt-28 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-lg text-center">
        <BrandLogo className="mx-auto mb-8" />
        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-4">
          {ok ? "Unsubscribed" : "Unable to unsubscribe"}
        </h1>
        <p className="text-white/60 mb-8">{message}</p>
        <Link href="/fleet">
          <Button className="bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest">
            Browse Car Rental
          </Button>
        </Link>
      </div>
    </div>
  );
}
