import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { isNavActive, MOBILE_NAV_TABS } from "@/constants/navigation";

const BAR_HEIGHT = 56;
const VIEW_HEIGHT = 72;
const CORNER_R = 28;
const NOTCH_HALF = 34;
const BUBBLE_SIZE = 56;

/** Pill bar with a smooth liquid dip centered on `cx` (reference-style notch). */
function buildLiquidBarPath(width: number, cx: number) {
  const top = 16;
  const dip = 2;
  const left = CORNER_R;
  const right = width - CORNER_R;
  const n0 = Math.max(left, cx - NOTCH_HALF - 14);
  const n1 = Math.max(left, cx - NOTCH_HALF);
  const n2 = Math.min(right, cx + NOTCH_HALF);
  const n3 = Math.min(right, cx + NOTCH_HALF + 14);

  return `
    M ${left} ${top}
    H ${n0}
    C ${cx - NOTCH_HALF * 0.72} ${top}, ${cx - NOTCH_HALF * 0.42} ${dip}, ${cx} ${dip}
    C ${cx + NOTCH_HALF * 0.42} ${dip}, ${cx + NOTCH_HALF * 0.72} ${top}, ${n3} ${top}
    H ${right}
    A ${CORNER_R} ${CORNER_R} 0 0 1 ${width} ${top + CORNER_R}
    V ${VIEW_HEIGHT - CORNER_R}
    A ${CORNER_R} ${CORNER_R} 0 0 1 ${right} ${VIEW_HEIGHT}
    H ${left}
    A ${CORNER_R} ${CORNER_R} 0 0 1 0 ${VIEW_HEIGHT - CORNER_R}
    V ${top + CORNER_R}
    A ${CORNER_R} ${CORNER_R} 0 0 1 ${left} ${top}
    Z
  `;
}

export function MobileCurvedNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const barRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [layout, setLayout] = useState({ x: 0, width: 320, ready: false });

  const mobileTabs = useMemo(
    () =>
      MOBILE_NAV_TABS.map((tab) => ({
        ...tab,
        href: tab.authHref && isAuthenticated ? tab.authHref : tab.href,
      })),
    [isAuthenticated],
  );

  const activeIndex = Math.max(
    0,
    mobileTabs.findIndex((tab) => isNavActive(tab.href, location)),
  );

  const measure = useCallback(() => {
    const bar = barRef.current;
    const el = itemRefs.current[activeIndex];
    if (!bar || !el) return;
    const barRect = bar.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    setLayout({
      x: itemRect.left - barRect.left + itemRect.width / 2,
      width: barRect.width,
      ready: true,
    });
  }, [activeIndex]);

  useLayoutEffect(() => {
    measure();
  }, [measure, location]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(bar);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const cx = layout.ready ? layout.x : layout.width / 2;
  const barPath = useMemo(
    () => buildLiquidBarPath(layout.width, cx),
    [layout.width, cx],
  );

  const ActiveIcon = mobileTabs[activeIndex]?.icon ?? MOBILE_NAV_TABS[0]!.icon;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
      aria-label="Mobile navigation"
    >
      <div className="pointer-events-auto flex justify-center px-5">
        <div
          ref={barRef}
          className="relative w-full max-w-[26rem]"
          style={{ height: `${VIEW_HEIGHT + BUBBLE_SIZE / 2 - 8}px` }}
        >
          <svg
            className="absolute inset-x-0 bottom-0 w-full text-[var(--mobile-nav-bar)] drop-shadow-[0_8px_32px_rgba(0,0,0,0.65)]"
            style={{ height: VIEW_HEIGHT }}
            viewBox={`0 0 ${layout.width} ${VIEW_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <path fill="currentColor" d={barPath} />
            <path
              fill="none"
              stroke="hsl(var(--primary))"
              strokeOpacity={0.35}
              strokeWidth={1}
              d={barPath}
            />
          </svg>

          <motion.div
            className="absolute z-20 flex items-center justify-center rounded-full bg-primary shadow-[0_6px_28px_hsl(var(--primary)/0.55)] ring-2 ring-black/20"
            style={{
              width: BUBBLE_SIZE,
              height: BUBBLE_SIZE,
              top: 0,
            }}
            initial={false}
            animate={{ left: cx, x: "-50%" }}
            transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.85 }}
          >
            <ActiveIcon size={26} strokeWidth={2.25} className="text-black" aria-hidden />
          </motion.div>

          <div
            className="absolute inset-x-0 bottom-0 flex items-center justify-between"
            style={{ height: BAR_HEIGHT }}
          >
            {mobileTabs.map((tab, i) => {
              const active = i === activeIndex;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className="relative flex h-full flex-1 min-w-0 items-center justify-center"
                  aria-label={tab.name}
                  aria-current={active ? "page" : undefined}
                >
                  {!active && (
                    <Icon
                      size={22}
                      strokeWidth={2}
                      className="text-primary/55 transition-colors duration-200"
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
