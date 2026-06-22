import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowRight, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PageLoading } from "@/components/ui/PageStatus";
import { useToast } from "@/hooks/use-toast";
import { FADE_UP_SM as FADE_UP } from "@/lib/motion";
import { useBranding } from "@/lib/api";
import { brandDisplayName } from "@/lib/api/branding-ui";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/context/AuthContext";
import { authReturnPath } from "@/lib/auth-redirect";
import { BrandLogo } from "@/components/brand/BrandLogo";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: branding } = useBranding();
  const brandName = brandDisplayName(branding);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const returnTo = authReturnPath(
    typeof window !== "undefined" ? window.location.search : "",
    "/booking",
  );

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setLocation(returnTo);
    }
  }, [authLoading, isAuthenticated, returnTo, setLocation]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    setSubmitting(true);
    try {
      const result = await login(values.email, values.password);
      toast({
        title: "Welcome back",
        description: `Signed in as ${result.user.name || result.user.email}.`,
        className: "bg-black border-primary text-white",
      });
      setLocation(returnTo);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not sign in. Please try again.";
      toast({ title: "Sign in failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Checking session…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-page pt-28 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={FADE_UP}
          className="max-w-3xl mb-10 md:mb-14"
        >
          <div className="w-12 h-1 bg-primary mb-8" />
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">
            Member <span className="text-primary">Login</span>
          </h1>
          <p className="text-lg text-white/60 font-light max-w-xl">
            Sign in to manage reservations, saved trips, and guest details with {brandName}.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex flex-col justify-between surface-panel border rounded-xl p-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <BrandLogo className="mb-8" />
              <p className="text-white/60 leading-relaxed">
                Sign in with the email and password registered on your account. After login you can continue to book
                vehicles available for rent.
              </p>
            </div>
            <div className="relative z-10 pt-10 border-t border-theme">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Need a vehicle?</p>
              <Link href="/fleet">
                <Button variant="outline" className="border-theme text-white hover:bg-white/10 uppercase font-bold tracking-widest">
                  Car Rental <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="surface-panel border rounded-xl p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-white">Sign In</h2>
                <p className="text-white/50 text-sm">Use your account credentials</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-white/70">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="pl-11 surface-input border-theme h-14 focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-white/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-primary text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-white/70">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                          <Input
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="pl-11 surface-input border-theme h-14 focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-white/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-primary text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end -mt-2">
                  <Link href="/forgot-password" className="text-xs text-primary font-semibold hover:underline uppercase tracking-wider">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-black hover:bg-primary/90 h-14 uppercase font-bold tracking-widest"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing in…
                    </>
                  ) : (
                    <>
                      Login <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <p className="text-center text-white/50 text-sm mt-8">
              Don&apos;t have an account?{" "}
              <Link href={`/signup?return=${encodeURIComponent(returnTo)}`} className="text-primary font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
