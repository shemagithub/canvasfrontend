import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowRight, Loader2, Lock, Mail, Phone, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

const signUpSchema = z
  .object({
    name: z.string().min(1, "Full name is required.").max(120, "Name is too long."),
    email: z.string().email("Enter a valid email address."),
    phone: z
      .string()
      .min(7, "Phone must be at least 7 characters.")
      .max(32, "Phone must be at most 32 characters."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password is too long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to create an account." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: branding } = useBranding();
  const brandName = brandDisplayName(branding);
  const { register, isAuthenticated, loading: authLoading } = useAuth();
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

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false as unknown as true,
    },
  });

  async function onSubmit(values: SignUpForm) {
    setSubmitting(true);
    try {
      const result = await register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      toast({
        title: "Account created",
        description: `Welcome, ${result.user.name}. You are now signed in.`,
        className: "bg-black border-primary text-white",
      });
      setLocation(returnTo);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not sign up. Please try again.";
      toast({ title: "Sign up failed", description: message, variant: "destructive" });
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
            Create <span className="text-primary">Account</span>
          </h1>
          <p className="text-lg text-white/60 font-light max-w-xl">
            Create an account with {brandName} to book faster and keep your travel reservations in one place.
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
              <p className="text-white/60 leading-relaxed mb-6">
                Your details are saved securely so you can sign in and reserve from our fleet.
              </p>
              <ul className="space-y-3 text-sm text-white/50">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Full name
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Email address (used to sign in)
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Phone number (7–32 characters)
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Password (minimum 8 characters)
                </li>
              </ul>
            </div>
            <div className="relative z-10 pt-10 border-t border-theme">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Already registered?</p>
              <Link href={`/login?return=${encodeURIComponent(returnTo)}`}>
                <Button
                  variant="outline"
                  className="border-theme text-white hover:bg-white/10 uppercase font-bold tracking-widest"
                >
                  Sign in <ArrowRight className="ml-2 h-4 w-4" />
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
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-white">Sign Up</h2>
                <p className="text-white/50 text-sm">All fields are required</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-white/70">
                        Full name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                          <Input
                            autoComplete="name"
                            placeholder="John Doe"
                            className="pl-11 surface-input border-theme h-12 focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-white/20"
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
                            className="pl-11 surface-input border-theme h-12 focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-white/20"
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-white/70">Phone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                          <Input
                            type="tel"
                            autoComplete="tel"
                            placeholder="+250788000000"
                            className="pl-11 surface-input border-theme h-12 focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-white/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-primary text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs tracking-widest text-white/70">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                            <Input
                              type="password"
                              autoComplete="new-password"
                              placeholder="Min. 8 characters"
                              className="pl-11 surface-input border-theme h-12 focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-white/20"
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
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs tracking-widest text-white/70">
                          Confirm
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                            <Input
                              type="password"
                              autoComplete="new-password"
                              placeholder="Repeat password"
                              className="pl-11 surface-input border-theme h-12 focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-white/20"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-primary text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start space-x-2 pt-1">
                        <FormControl>
                          <Checkbox
                            checked={field.value === true}
                            onCheckedChange={(v) => field.onChange(v === true)}
                            className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black mt-0.5"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal text-white/70 leading-snug">
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>
                        </FormLabel>
                      </div>
                      <FormMessage className="text-primary text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-black hover:bg-primary/90 h-14 uppercase font-bold tracking-widest mt-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating account…
                    </>
                  ) : (
                    <>
                      Sign up <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <p className="text-center text-white/50 text-sm mt-8">
              Already have an account?{" "}
              <Link href={`/login?return=${encodeURIComponent(returnTo)}`} className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
