import { motion } from "framer-motion";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapPin, Phone, Mail, Clock, Send, Share2, MessageCircle } from "lucide-react";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { socialLinksFromBranding } from "@/lib/api/social-links";

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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FADE_UP_SM as FADE_UP } from "@/lib/motion";
import { useBranding, useContactMutation, useContactPage } from "@/lib/api";
import { brandAddress, brandEmail, brandPhone } from "@/lib/api/branding-ui";
import { mailtoHref, phoneOrWhatsAppHref } from "@/lib/api/contact-links";
import { whatsAppLinkFromBranding } from "@/lib/api/social-links";
import { ApiError } from "@/lib/api/client";
import { ContactLocationsMap } from "@/components/contact/ContactLocationsMap";
import { useAuth } from "@/context/AuthContext";
import { getStoredUser } from "@/lib/api/auth";
import { guestDetailsFromUser } from "@/lib/auth-guest-details";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export default function Contact() {
  const { toast } = useToast();
  const { data: contactPage } = useContactPage();
  const page = contactPage?.sections;
  const contactMutation = useContactMutation();
  const { data: branding } = useBranding();
  const { user, loading: authLoading } = useAuth();
  const company = branding?.company;
  const socialLinks = socialLinksFromBranding(branding);
  const phone = brandPhone(branding);
  const email = brandEmail(branding);
  const whatsAppUrl = whatsAppLinkFromBranding(branding);
  const phoneLink = phoneOrWhatsAppHref(phone);

  const initialGuest = guestDetailsFromUser(getStoredUser());
  const defaultName =
    initialGuest.fullName ||
    [initialGuest.firstName, initialGuest.lastName].filter(Boolean).join(" ");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultName,
      email: initialGuest.email,
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (authLoading || !user) return;
    const fromUser = guestDetailsFromUser(user);
    const name =
      fromUser.fullName || [fromUser.firstName, fromUser.lastName].filter(Boolean).join(" ");
    if (!form.getValues("name") && name) form.setValue("name", name);
    if (!form.getValues("email") && fromUser.email) form.setValue("email", fromUser.email);
  }, [user, authLoading, form]);

  function resetContactForm() {
    const fromUser = guestDetailsFromUser(user ?? getStoredUser());
    const name =
      fromUser.fullName || [fromUser.firstName, fromUser.lastName].filter(Boolean).join(" ");
    form.reset({
      name,
      email: fromUser.email,
      subject: "",
      message: "",
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await contactMutation.mutateAsync(values);
      toast({
        title: "Transmission Received",
        description: "Our concierge team will respond shortly.",
        className: "bg-black border-primary text-white ",
      });
      resetContactForm();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not send your message. Please try again.";
      toast({
        title: "Send Failed",
        description: message,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen surface-page pt-28 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={FADE_UP}
          className="max-w-3xl mb-16"
        >
          <div className="w-12 h-1 bg-primary mb-8" />
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">
            {page?.titleLine1 ?? "Get in"}{" "}
            <span className="text-primary">{page?.titleLine2 ?? "Touch"}</span>
          </h1>
          <p className="text-xl text-white/60 font-light">
            {page?.subtitle ??
              "Questions about a road trip, picnic rental, group booking, or hospitality transfer? Our team is here to help."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 surface-panel p-8 md:p-12 border rounded-xl"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs tracking-widest text-white/70">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            className="surface-input border-theme h-14 focus-visible:ring-primary focus-visible:border-primary placeholder:text-white/20 text-white"
                            {...field}
                          />
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
                        <FormLabel className="uppercase text-xs tracking-widest text-white/70">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john@example.com"
                            className="surface-input border-theme h-14 focus-visible:ring-primary focus-visible:border-primary placeholder:text-white/20 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-primary text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-white/70">Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Vehicle Inquiry"
                          className="surface-input border-theme h-14 focus-visible:ring-primary focus-visible:border-primary placeholder:text-white/20 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-primary text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-white/70">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How can we assist you?"
                          className="surface-input border-theme min-h-[160px] resize-none focus-visible:ring-primary focus-visible:border-primary placeholder:text-white/20 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-primary text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  disabled={contactMutation.isPending}
                  className="w-full bg-primary text-black hover:bg-primary/90 h-16 uppercase font-bold tracking-widest group"
                >
                  {contactMutation.isPending ? "Sending…" : "Transmit Message"}
                  <Send className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </Form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-5 space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-8">Headquarters</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium uppercase tracking-wider text-sm mb-1">Address</p>
                    <p className="text-white/60 leading-relaxed">
                      {[company?.address_line1, company?.city, company?.country].filter(Boolean).join(", ") ||
                        brandAddress(branding)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium uppercase tracking-wider text-sm mb-1">Direct Line</p>
                    {phoneLink.href ? (
                      <a
                        href={phoneLink.href}
                        {...(phoneLink.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="text-white/60 hover:text-primary transition-colors"
                      >
                        {phone}
                      </a>
                    ) : (
                      <p className="text-white/60">{phone}</p>
                    )}
                  </div>
                </div>
                {whatsAppUrl && (
                  <div className="flex items-start gap-4">
                    <MessageCircle className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-medium uppercase tracking-wider text-sm mb-1">WhatsApp</p>
                      <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-primary transition-colors"
                      >
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium uppercase tracking-wider text-sm mb-1">Digital</p>
                    <a
                      href={mailtoHref(email)}
                      className="text-white/60 hover:text-primary transition-colors break-all"
                    >
                      {email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium uppercase tracking-wider text-sm mb-1">Operating Hours</p>
                    <p className="text-white/60 whitespace-pre-line">
                      {branding?.business_hours_text || "Mon–Fri: 8AM – 8PM\nWeekend: 9AM – 6PM"}
                    </p>
                  </div>
                </div>

                {socialLinks.length > 0 && (
                  <div className="flex items-start gap-4 pt-2">
                    <Share2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-medium uppercase tracking-wider text-sm mb-3">Social</p>
                      <SocialLinks variant="contact" links={socialLinks} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {socialLinks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 surface-panel border rounded-xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">
                Connect on <span className="text-primary">Social</span>
              </h3>
              <p className="text-white/50 text-sm max-w-md">
                Follow {branding?.company_name || "us"} for trip ideas, picnic packages, hospitality offers, and travel inspiration.
              </p>
            </div>
            <SocialLinks variant="contact" links={socialLinks} className="md:justify-end" />
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mt-12 md:mt-16"
        >
          <ContactLocationsMap mapHeight="min-h-[400px] h-[400px] md:min-h-[480px] md:h-[480px]" />
        </motion.section>
      </div>
    </div>
  );
}
