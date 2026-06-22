import { Loader2 } from "lucide-react";

export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-theme-muted">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm uppercase tracking-widest">{label}</p>
    </div>
  );
}

export function PageError({ message }: { message?: string }) {
  return (
    <div className="text-center py-20 text-theme-muted">
      <p className="text-primary font-bold uppercase tracking-widest mb-2">Could not load data</p>
      <p className="text-sm max-w-md mx-auto">{message ?? "Please check that the API server is running and try again."}</p>
    </div>
  );
}
