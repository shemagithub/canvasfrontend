import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type HeroSlideshowProps = {
  images: string[];
  intervalSeconds?: number;
  className?: string;
};

/**
 * Full-bleed crossfade hero backgrounds with crisp, centered cover fit.
 */
export function HeroSlideshow({ images, intervalSeconds = 6, className }: HeroSlideshowProps) {
  const slides = images.length ? images : [];
  const [index, setIndex] = useState(0);
  const intervalMs = Math.max(3, intervalSeconds) * 1000;

  useEffect(() => {
    setIndex(0);
  }, [slides.join("|")]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  if (!slides.length) return null;

  return (
    <div className={cn("absolute inset-0 overflow-hidden theme-hero-shell", className)} aria-hidden>
      {slides.map((src, i) => {
        const active = i === index;
        return (
          <div
            key={`${src}-${i}`}
            className={cn(
              "absolute inset-0 transition-opacity duration-[2200ms] ease-in-out",
              active ? "opacity-100 z-[1]" : "opacity-0 z-0",
            )}
            style={{ "--hero-slide-duration": `${intervalSeconds}s` } as CSSProperties}
          >
            <img
              src={src}
              alt=""
              sizes="100vw"
              fetchPriority={i === 0 ? "high" : undefined}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              className={cn(
                "absolute left-1/2 top-1/2 min-h-full min-w-full max-w-none w-auto h-auto object-cover object-center theme-slideshow-slide",
                active ? "animate-hero-ken-burns-subtle" : "hero-slide-idle",
              )}
            />
          </div>
        );
      })}

      <div className="absolute inset-0 z-[2] theme-slideshow-scrim pointer-events-none" />

      {slides.length > 1 && (
        <div className="absolute bottom-24 left-1/2 z-[4] flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === index ? "w-8 bg-primary" : "w-1.5 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
