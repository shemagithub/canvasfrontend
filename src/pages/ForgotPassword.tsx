import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { FADE_UP_SM as FADE_UP } from "@/lib/motion";
import { useBranding } from "@/lib/api";
import { brandDisplayName } from "@/lib/api/branding-ui";
import { requestPasswordReset } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { BrandLogo } from "@/components/brand/BrandLogo";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const { data: branding } = useBranding();
  const brandName = brandDisplayName(branding);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const result = await requestPasswordReset(values.email);
      setSent(true);
      toast({
        title: "Check your inbox",
        description: result.message,
        className: "bg-black border-primary text-white",
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not send reset email.";
      toast({ title: "Request failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen surface-page pt-28 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-lg">
        <motion.div initial="hidden" animate="visible" variants={FADE_UP} className="mb-10">
          <BrandLogo className="mb-8" />
          <div className="w-12 h-1 bg-primary mb-8" />
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">
            Reset <span className="text-primary">Password</span>
          </h1>
          <p className="text-lg text-white/60 font-light">
            Enter the email on your {brandName} account. We&apos;ll send a secure link to choose a new password.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-panel border rounded-xl p-8 md:p-10"
        >
          {sent ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <p className="text-white/70 leading-relaxed">
                If an account exists for that address, reset instructions are on the way. The link expires in 1 hour.
              </p>
              <Link href="/login">
                <Button className="w-full bg-primary text-black hover:bg-primary/90 h-12 uppercase font-bold tracking-widest">
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
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
                            className="pl-11 surface-input border-theme h-14 focus-visible:ring-primary text-white placeholder:text-white/20"
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
                  className="w-full bg-primary text-black hover:bg-primary/90 h-14 uppercase font-bold tracking-widest"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      Send reset link <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}

          <p className="text-center text-white/50 text-sm mt-8">
            <Link href="/login" className="inline-flex items-center gap-1 text-primary font-bold hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
