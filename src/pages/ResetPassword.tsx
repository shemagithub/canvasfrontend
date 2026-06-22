import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowRight, Loader2, Lock } from "lucide-react";
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
import { resetPasswordWithToken, validatePasswordResetToken } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { BrandLogo } from "@/components/brand/BrandLogo";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters.").max(128),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function readToken(search: string): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return params.get("token")?.trim() ?? "";
}

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const token = useMemo(
    () => readToken(typeof window !== "undefined" ? window.location.search : ""),
    [],
  );
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    validatePasswordResetToken(token)
      .then((r) => {
        setValid(true);
        setAccountEmail(r.email);
      })
      .catch(() => setValid(false))
      .finally(() => setChecking(false));
  }, [token]);

  async function onSubmit(values: FormValues) {
    if (!token) return;
    setSubmitting(true);
    try {
      const result = await resetPasswordWithToken(token, values.password);
      setDone(true);
      toast({
        title: "Password updated",
        description: result.message,
        className: "bg-black border-primary text-white",
      });
      setTimeout(() => setLocation("/login"), 1500);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not reset password.";
      toast({ title: "Reset failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Checking reset link…" />
      </div>
    );
  }

  if (!token || !valid) {
    return (
      <div className="min-h-screen surface-page pt-28 pb-24">
        <div className="container mx-auto px-4 md:px-8 max-w-lg text-center">
          <BrandLogo className="mx-auto mb-8" />
          <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Link expired</h1>
          <p className="text-white/60 mb-8">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password">
            <Button className="bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest">
              Request a new link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-page pt-28 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-lg">
        <motion.div initial="hidden" animate="visible" variants={FADE_UP} className="mb-10">
          <BrandLogo className="mb-8" />
          <div className="w-12 h-1 bg-primary mb-8" />
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">
            New <span className="text-primary">Password</span>
          </h1>
          {accountEmail && (
            <p className="text-sm text-white/50">
              Setting a new password for <span className="text-primary font-medium">{accountEmail}</span>
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-panel border rounded-xl p-8 md:p-10"
        >
          {done ? (
            <p className="text-center text-white/70">Redirecting to sign in…</p>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-white/70">New password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                          <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Min. 8 characters"
                            className="pl-11 surface-input border-theme h-12 text-white placeholder:text-white/20"
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
                      <FormLabel className="uppercase text-xs tracking-widest text-white/70">Confirm password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                          <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Repeat password"
                            className="pl-11 surface-input border-theme h-12 text-white placeholder:text-white/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
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
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating…
                    </>
                  ) : (
                    <>
                      Update password <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
