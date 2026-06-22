import { useEffect } from "react";
import { useSeoContext } from "@/context/SeoContext";
import type { SeoPayload } from "@/lib/seo";

/** Override route-level SEO for the current page (cleared on unmount). */
export function PageSeo(props: SeoPayload) {
  const { setOverride } = useSeoContext();

  useEffect(() => {
    setOverride(props);
    return () => setOverride(null);
  }, [
    setOverride,
    props.title,
    props.description,
    props.image,
    props.type,
    props.canonicalPath,
    props.noindex,
    props.jsonLd,
  ]);

  return null;
}
