import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { MobileCurvedNav } from "@/components/layout/MobileCurvedNav";
import { useAuth, userDisplayName } from "@/context/AuthContext";
import { isNavActive, PRIMARY_NAV_LINKS } from "@/constants/navigation";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const memberLabel = user ? userDisplayName(user).toUpperCase() : "LOGIN";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 top-0 max-md:bg-[var(--navbar-bg)] max-md:backdrop-blur-md max-md:border-b ${
          isScrolled
            ? "backdrop-blur-md border-b border-white/5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 max-md:pt-[calc(env(safe-area-inset-top)+0.75rem)] max-md:pb-3"
            : "bg-transparent pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-6 max-md:pt-[calc(env(safe-area-inset-top)+0.75rem)] max-md:pb-3"
        }`}
        style={{
          ...(isScrolled ? { backgroundColor: "var(--navbar-bg)" } : {}),
          borderColor: "var(--bottom-bar-border)",
        }}
      >
        <div className="container mx-auto px-4 md:px-8 flex h-11 max-md:h-11 items-center justify-between gap-3 md:gap-4">
          <Link href="/" className="cursor-pointer group flex min-w-0 shrink items-center">
            <BrandLogo className="transition-opacity duration-300 group-hover:opacity-90" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {PRIMARY_NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary cursor-pointer ${
                    isNavActive(link.href, location) ? "text-primary" : ""
                  }`}
                  style={!isNavActive(link.href, location) ? { color: "var(--text-muted)" } : undefined}
                >
                  {link.name}
                </span>
              </Link>
            ))}
          </nav>

          <div className="relative z-[60] flex shrink-0 md:hidden items-center self-center">
            <ThemeToggle compact />
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href={isAuthenticated ? "/account" : "/login"}>
              <Button
                className="bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-wider px-6 gap-2"
                aria-label={isAuthenticated ? "My account" : "Login"}
              >
                <User className="h-5 w-5" />
                {authLoading ? "…" : memberLabel}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <MobileCurvedNav />
    </>
  );
}
