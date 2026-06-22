import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SeoPayload } from "@/lib/seo";

type SeoContextValue = {
  override: SeoPayload | null;
  setOverride: (value: SeoPayload | null) => void;
};

const SeoContext = createContext<SeoContextValue | null>(null);

export function SeoProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<SeoPayload | null>(null);
  const value = useMemo(() => ({ override, setOverride }), [override]);
  return <SeoContext.Provider value={value}>{children}</SeoContext.Provider>;
}

export function useSeoContext(): SeoContextValue {
  const ctx = useContext(SeoContext);
  if (!ctx) {
    throw new Error("useSeoContext must be used within SeoProvider");
  }
  return ctx;
}
