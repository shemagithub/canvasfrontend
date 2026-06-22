import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const SIZES = {
  default: { knob: 32, padding: 6 },
  compact: { knob: 28, padding: 6 },
} as const;

type ThemeToggleProps = {
  className?: string;
  compact?: boolean;
};

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const { knob: knobSize, padding: trackPadding } = compact ? SIZES.compact : SIZES.default;
  const trackRef = useRef<HTMLButtonElement>(null);
  const [travel, setTravel] = useState(0);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.offsetWidth;
    setTravel(Math.max(0, width - trackPadding * 2 - knobSize));
  }, [knobSize, trackPadding]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(track);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <button
      ref={trackRef}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={cn(
        "theme-toggle relative shrink-0 rounded-full",
        compact
          ? "h-11 w-[4.75rem] min-h-11 min-w-[4.75rem]"
          : "h-11 w-[5.25rem] min-h-[44px] min-w-[5.25rem]",
        "touch-manipulation select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "focus-visible:ring-offset-[var(--surface-base)]",
        "active:scale-[0.97] transition-transform duration-150",
        className,
      )}
      style={{
        padding: trackPadding,
        boxShadow:
          "inset 0 2px 8px rgba(0,0,0,0.28), inset 0 -1px 2px rgba(255,255,255,0.06)",
      }}
    >
      {/* Track backgrounds */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full overflow-hidden transition-opacity duration-200 ease-out",
          isDark ? "opacity-0" : "opacity-100",
        )}
        style={{
          background: "linear-gradient(180deg, #7ec8f0 0%, #5eb8e8 50%, #4aa8dc 100%)",
        }}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full overflow-hidden transition-opacity duration-200 ease-out",
          isDark ? "opacity-100" : "opacity-0",
        )}
        style={{
          background: "linear-gradient(135deg, #1a2744 0%, #0f1729 55%, #0a0e18 100%)",
        }}
      />

      {/* Sliding knob */}
      <span
        aria-hidden
        className={cn(
          "relative z-10 flex items-center justify-center rounded-full shadow-md",
          "transition-transform duration-250 ease-[cubic-bezier(0.34,1.25,0.64,1)]",
          isDark
            ? "bg-gradient-to-br from-zinc-100 to-zinc-300 text-zinc-700"
            : "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950",
        )}
        style={{
          width: knobSize,
          height: knobSize,
          transform: isDark ? `translateX(${travel}px)` : "translateX(0)",
        }}
      >
        {isDark ? (
          <Moon className="h-4 w-4" strokeWidth={2.25} />
        ) : (
          <Sun className="h-4 w-4" strokeWidth={2.25} />
        )}
      </span>
    </button>
  );
}
