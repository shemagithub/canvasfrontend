import { Car } from "lucide-react";

/** Decorative wavy skyline — fill follows active theme via --footer-wave-fill */
export function FooterWaveArt() {
  return (
    <div
      className="relative w-full overflow-hidden pointer-events-none select-none text-[var(--footer-wave-fill)]"
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 140"
        className="block w-full h-[72px] sm:h-[88px] md:h-[110px]"
        preserveAspectRatio="none"
      >
        <g fill="currentColor">
          <ellipse cx="180" cy="78" rx="28" ry="22" />
          <ellipse cx="230" cy="82" rx="22" ry="18" />
          <rect x="320" y="52" width="18" height="42" rx="2" />
          <rect x="345" y="38" width="22" height="56" rx="2" />
          <rect x="375" y="48" width="16" height="46" rx="2" />
          <rect x="398" y="32" width="28" height="62" rx="2" />
          <rect x="435" y="44" width="20" height="50" rx="2" />
          <circle cx="520" cy="86" r="20" />
          <circle cx="560" cy="90" r="16" />
          <rect x="900" y="46" width="24" height="48" rx="2" />
          <rect x="932" y="36" width="18" height="58" rx="2" />
          <rect x="958" y="50" width="30" height="44" rx="2" />
          <circle cx="1100" cy="84" r="22" />
          <circle cx="1145" cy="88" r="17" />
          <circle cx="1280" cy="80" r="24" />
        </g>
        <path
          fill="currentColor"
          d="M0,95 C120,55 240,115 360,75 C480,35 600,105 720,65 C840,25 960,95 1080,70 C1200,45 1320,85 1440,60 L1440,140 L0,140 Z"
        />
      </svg>

      <div className="absolute left-[12%] top-[18%] hidden sm:block">
        <Car
          className="h-9 w-9 md:h-11 md:w-11 rotate-[-12deg] text-primary"
          style={{ filter: "drop-shadow(0 4px 12px hsl(var(--primary) / 0.4))" }}
          strokeWidth={1.75}
          fill="hsl(var(--primary) / 0.12)"
        />
      </div>
      <div className="absolute right-[14%] top-[22%] hidden sm:block">
        <Car
          className="h-9 w-9 md:h-11 md:w-11 rotate-[10deg] scale-x-[-1] text-primary"
          style={{ filter: "drop-shadow(0 4px 12px hsl(var(--primary) / 0.4))" }}
          strokeWidth={1.75}
          fill="hsl(var(--primary) / 0.12)"
        />
      </div>
    </div>
  );
}
