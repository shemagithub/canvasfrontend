import { useState, type ImgHTMLAttributes, type SyntheticEvent } from "react";
import { cn } from "@/lib/utils";

type CmsImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** Shown when `src` is missing or fails to load. */
  fallback?: string;
};

/** Image with automatic fallback when CMS / API asset URLs fail. */
export function CmsImage({ src, fallback, className, onError, alt = "", ...props }: CmsImageProps) {
  const [useFallback, setUseFallback] = useState(false);
  const primary = (src ?? "").trim();
  const display = useFallback || !primary ? fallback : primary;

  if (!display) return null;

  function handleError(e: SyntheticEvent<HTMLImageElement>) {
    if (!useFallback && fallback && e.currentTarget.src !== fallback) {
      setUseFallback(true);
      e.currentTarget.onerror = null;
    }
    onError?.(e);
  }

  return (
    <img
      {...props}
      alt={alt}
      src={display}
      className={cn(className)}
      onError={handleError}
    />
  );
}
