import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ArrowRight, Calendar, Loader2, LogOut, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/PageStatus";
import { FADE_UP_SM as FADE_UP } from "@/lib/motion";
import { useAuth, userDisplayName } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MyBookingsSection } from "@/components/account/MyBookingsSection";

export default function Account() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login?return=/account");
    }
  }, [loading, isAuthenticated, setLocation]);

  async function handleLogout() {
    await logout();
    toast({
      title: "Signed out",
      description: "You have been logged out successfully.",
      className: "bg-black border-primary text-white",
    });
    setLocation("/");
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Loading account…" />
      </div>
    );
  }

  const firstName = userDisplayName(user);

  return (
    <div className="min-h-screen surface-page pt-28 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <motion.div initial="hidden" animate="visible" variants={FADE_UP} className="mb-10">
          <div className="w-12 h-1 bg-primary mb-8" />
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-2">
            Hello, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="text-white/60">Manage your reservations, update trip details, and book again.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="surface-panel border rounded-xl p-8 md:p-10 space-y-8"
        >
          <div className="flex items-center gap-4 pb-6 border-b border-theme">
            <BrandLogo />
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40">Signed in as</p>
              <p className="font-bold text-lg text-white">{user.name || user.email}</p>
            </div>
          </div>

          <dl className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-white/40">Full name</dt>
                <dd className="text-white font-medium">{user.name || "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-white/40">Email</dt>
                <dd className="text-white font-medium">{user.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-white/40">Phone</dt>
                <dd className="text-white font-medium">{user.phone?.trim() || "—"}</dd>
              </div>
            </div>
          </dl>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/booking" className="flex-1">
              <Button className="w-full bg-primary text-black hover:bg-primary/90 h-12 uppercase font-bold tracking-widest">
                <Calendar className="mr-2 h-4 w-4" /> Book a package
              </Button>
            </Link>
            <Link href="/reserve" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-theme text-white hover:bg-white/10 h-12 uppercase font-bold tracking-widest"
              >
                Rent a vehicle <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-theme">
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="text-white/60 hover:text-white hover:bg-white/5 uppercase text-xs tracking-widest font-bold"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="surface-panel border rounded-xl p-8 md:p-10 mt-8"
        >
          <MyBookingsSection />
        </motion.div>
      </div>
    </div>
  );
}
