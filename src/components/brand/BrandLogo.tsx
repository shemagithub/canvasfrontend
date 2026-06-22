import logoCanvas from "@/assets/images/logo_canvas.png";
import { cn } from "@/lib/utils";
import { useBranding } from "@/lib/api";
import { brandDisplayName, brandWordmarkLines, resolveBrandingLogoUrl } from "@/lib/api/branding-ui";

type BrandLogoProps = {
  variant?: "navbar" | "footer";
  className?: string;
};

export function BrandLogo({ variant = "navbar", className }: BrandLogoProps) {
  const { data: branding } = useBranding();
  const isFooter = variant === "footer";
  const logoSrc =
    resolveBrandingLogoUrl(branding?.logo_url, branding?.updated_at) ?? logoCanvas;
  const companyName = brandDisplayName(branding);
  const { line1, line2 } = brandWordmarkLines(companyName);
  const alt = `${companyName} logo`;

  return (
    <span
      className={cn(
        "inline-flex items-center shrink-0 min-w-0",
        className,
      )}
    >
      <img
        src={logoSrc}
        alt={alt}
        className={cn(
          "w-auto object-contain object-left shrink-0",
          isFooter
            ? "h-10 sm:h-12 max-w-[120px] sm:max-w-[140px]"
            : "h-11 max-w-[132px] sm:max-w-[140px] md:h-10 md:max-w-[120px] lg:h-11 lg:max-w-[140px]",
        )}
        width={isFooter ? 140 : 140}
        height={isFooter ? 48 : 44}
        decoding="async"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = logoCanvas;
        }}
      />
      <span
        className={cn(
          "brand-wordmark flex flex-col justify-center",
          isFooter ? "ml-1.5 sm:ml-2 text-[9px] sm:text-[10px] footer-heading" : "ml-1 sm:ml-1.5 lg:ml-2 text-[9px] sm:text-[9px] md:text-[10px] lg:text-xs xl:text-sm",
          "leading-[1.1]",
        )}
        title={companyName}
      >
        <span className="whitespace-nowrap">{line1}</span>
        {line2 ? <span className="whitespace-nowrap">{line2}</span> : null}
      </span>
    </span>
  );
}
