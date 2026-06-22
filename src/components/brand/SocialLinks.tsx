import type { ComponentType } from "react";
import {
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { useBranding } from "@/lib/api";
import { socialLinksFromBranding, type SocialLinkItem, type SocialPlatform } from "@/lib/api/social-links";

const ICONS: Record<SocialPlatform, ComponentType<{ className?: string }>> = {
  instagram: FaInstagram,
  x: FaXTwitter,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  whatsapp: FaWhatsapp,
};

type SocialLinksProps = {
  className?: string;
  iconClassName?: string;
  /** Pre-parsed links (skips hook). */
  links?: SocialLinkItem[];
  variant?: "footer" | "footer-dark" | "footer-theme" | "contact" | "pill";
  showLabels?: boolean;
};

export function SocialLinks({
  className,
  iconClassName,
  links: linksProp,
  variant = "footer",
  showLabels = false,
}: SocialLinksProps) {
  const { data: branding } = useBranding();
  const links = linksProp ?? socialLinksFromBranding(branding);

  if (links.length === 0) return null;

  const baseIcon =
    variant === "contact"
      ? "h-5 w-5"
      : variant === "pill"
        ? "h-4 w-4"
        : "h-[18px] w-[18px]";

  const buttonClass =
    variant === "contact"
      ? "h-12 w-12 rounded-xl border border-theme surface-input flex items-center justify-center text-white/70 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
      : variant === "footer-dark"
        ? "h-9 w-9 rounded-full flex items-center justify-center text-white/80 hover:text-primary hover:bg-white/10 transition-all duration-300"
        : variant === "footer-theme"
          ? "footer-social-btn h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300"
          : variant === "pill"
          ? "h-10 px-4 rounded-full border border-theme flex items-center justify-center gap-2 text-theme-muted hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
          : "h-10 w-10 rounded-lg border border-theme flex items-center justify-center text-theme-muted hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300";

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {links.map((item) => {
        const Icon = ICONS[item.platform];
        return (
          <a
            key={item.platform}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            title={item.label}
            className={buttonClass}
          >
            <Icon className={cn(baseIcon, iconClassName)} />
            {showLabels && (
              <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}
