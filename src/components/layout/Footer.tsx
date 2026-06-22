import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import { Link } from "wouter";
import { Loader2, Shield, Clock, Award } from "lucide-react";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { FooterWaveArt } from "@/components/layout/FooterWaveArt";
import { Input } from "@/components/ui/input";
import { BRAND } from "@/constants/brand";
import { useBranding, subscribeFleetAlerts } from "@/lib/api";
import { brandDisplayName, footerNewsletterBlurb } from "@/lib/api/branding-ui";
import { mailtoHref, phoneOrWhatsAppHref } from "@/lib/api/contact-links";
import { ApiError } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getStoredUser } from "@/lib/api/auth";
import { guestDetailsFromUser } from "@/lib/auth-guest-details";
import { FOOTER_INFO_LINKS } from "@/constants/navigation";

const TERMS_LINKS = [
  { label: "Privacy Policy", href: "/terms" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Rental Agreement", href: "/terms" },
  { label: "Cancellation Policy", href: "/terms" },
] as const;

const TRUST_BADGES = [
  { icon: Shield, label: "Secure Booking" },
  { icon: Award, label: "Licensed Rentals" },
  { icon: Clock, label: "24/7 Support" },
] as const;

const PAYMENT_LABELS = ["Bank Transfer", "Mobile Money", "Cash Delivery"] as const;

function FooterLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href}>
      <span className={cn("footer-link text-sm transition-colors cursor-pointer block", className)}>
        {children}
      </span>
    </Link>
  );
}

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h4 className="footer-heading font-bold text-base md:text-lg mb-5 tracking-tight">
      {children}
    </h4>
  );
}

export function Footer() {
  const { toast } = useToast();
  const { data: branding } = useBranding();
  const { user, loading: authLoading } = useAuth();
  const initialEmail = guestDetailsFromUser(getStoredUser()).email;
  const [email, setEmail] = useState(initialEmail);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (authLoading || !user?.email) return;
    setEmail((prev) => prev || user.email);
  }, [user, authLoading]);

  const company = branding?.company;
  const brandName = branding?.company_name || BRAND.name;

  const address =
    [company?.address_line1, company?.address_line2, company?.city, company?.country]
      .filter(Boolean)
      .join(", ") || BRAND.address.replace("\n", ", ");

  const phone = company?.phone || BRAND.phone;
  const emailContact = company?.email || BRAND.email.reservations;
  const phoneLink = phoneOrWhatsAppHref(phone);

  async function handleNewsletter(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setSubscribing(true);
    try {
      const result = await subscribeFleetAlerts(trimmed, user?.name ?? undefined);
      const signedInEmail = guestDetailsFromUser(user ?? getStoredUser()).email;
      setEmail(signedInEmail);
      toast({
        title: "You're subscribed",
        description: result.message || `Vehicle alerts enabled for ${brandName}.`,
        className: "bg-black border-primary text-white",
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not subscribe. Please try again.";
      toast({ title: "Subscription failed", description: message, variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  }

  return (
    <footer className="footer-site relative mt-8">
      <FooterWaveArt />

      <div className="container mx-auto px-4 md:px-8 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 py-10 md:py-14">
          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex mb-5 group">
              <BrandLogo variant="footer" className="transition-opacity duration-300 group-hover:opacity-90" />
            </Link>
            <p className="footer-text-muted text-sm mb-5 leading-relaxed">
              {footerNewsletterBlurb(branding)} Get an email when we add new rental vehicles.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col gap-3 max-w-sm">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                autoComplete="email"
                className="footer-input h-12 rounded-full px-5 focus-visible:ring-primary focus-visible:border-primary/60"
              />
              <button
                type="submit"
                disabled={subscribing}
                className={cn(
                  "h-12 rounded-full uppercase font-bold tracking-widest text-sm text-black",
                  "bg-gradient-to-r from-primary via-primary to-[hsl(0,79%,42%)]",
                  "hover:brightness-110 active:scale-[0.98] transition-all duration-200",
                  "shadow-[0_4px_20px_hsl(var(--primary)/0.45)]",
                  "disabled:opacity-60 disabled:pointer-events-none",
                )}
              >
                {subscribing ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Subscribing…
                  </span>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </div>

          {/* Terms + social */}
          <div>
            <FooterHeading>Terms &amp; Conditions</FooterHeading>
            <ul className="space-y-3 mb-8">
              {TERMS_LINKS.map((item) => (
                <li key={item.label}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
            <p className="footer-text-muted text-sm font-semibold mb-3">
              Follow {brandName}
            </p>
            <SocialLinks variant="footer-theme" />
          </div>

          {/* Information */}
          <div>
            <FooterHeading>Information</FooterHeading>
            <ul className="space-y-3 mb-6">
              {FOOTER_INFO_LINKS.map((item) => (
                <li key={item.label}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
            <div className="footer-text-muted text-sm space-y-1 border-t footer-divider pt-4">
              <p>
                <span className="footer-text-faint">Tel: </span>
                {phoneLink.href ? (
                  <a
                    href={phoneLink.href}
                    {...(phoneLink.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="footer-link hover:text-primary transition-colors"
                  >
                    {phone}
                  </a>
                ) : (
                  phone
                )}
              </p>
              <p>
                <span className="footer-text-faint">Email: </span>
                <a
                  href={mailtoHref(emailContact)}
                  className="footer-link hover:text-primary transition-colors break-all"
                >
                  {emailContact}
                </a>
              </p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <FooterHeading>Contact</FooterHeading>
            <ul className="space-y-4 text-sm footer-text-muted">
              <li>
                <span className="footer-text-faint block text-xs uppercase tracking-widest mb-1">
                  Reservations
                </span>
                {phoneLink.href ? (
                  <a
                    href={phoneLink.href}
                    {...(phoneLink.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="footer-link transition-colors hover:text-primary"
                  >
                    {phone}
                  </a>
                ) : (
                  <span>{phone}</span>
                )}
              </li>
              <li>
                <span className="footer-text-faint block text-xs uppercase tracking-widest mb-1">
                  Email
                </span>
                <a href={mailtoHref(emailContact)} className="footer-link transition-colors break-all hover:text-primary">
                  {emailContact}
                </a>
              </li>
              <li>
                <span className="footer-text-faint block text-xs uppercase tracking-widest mb-1">
                  Head Office
                </span>
                <span className="whitespace-pre-line leading-relaxed">{address}</span>
              </li>
              {branding?.business_hours_text && (
                <li>
                  <span className="footer-text-faint block text-xs uppercase tracking-widest mb-1">
                    Hours
                  </span>
                  <span className="whitespace-pre-line">{branding.business_hours_text}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Utility bar */}
        <div className="border-t footer-divider pt-8 pb-6 space-y-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="footer-badge flex items-center gap-2 px-3 py-2 rounded-lg border"
                >
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2" aria-hidden>
              {["🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇩🇪", "🇫🇷"].map((flag) => (
                <span
                  key={flag}
                  className="text-lg opacity-80 hover:opacity-100 transition-opacity"
                  title="Regions we serve"
                >
                  {flag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {PAYMENT_LABELS.map((label) => (
                <span
                  key={label}
                  className="footer-badge px-3 py-1.5 rounded-md border text-[10px] font-bold uppercase tracking-widest"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="footer-text-faint text-xs">
              © {new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
            {branding?.footer_credit_line && (
              <p className="footer-text-faint text-xs opacity-80">{branding.footer_credit_line}</p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
