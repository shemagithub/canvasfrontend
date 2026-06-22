import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type {
  ContactPayload,
  MyDestinationBookingUpdatePayload,
  MyVehicleBookingUpdatePayload,
  PublicBookingPayload,
  PublicDestinationBookingPayload,
} from "./types";
import { defaultAboutSections, parseAboutSections } from "./about-cms";
import { blogCanonicalSlug } from "./blog-ui";
import { defaultDestinationsSections, parseDestinationsSections } from "./destinations-cms";
import { defaultServicesSections, parseServicesSections } from "./services-cms";
import {
  defaultBlogSections,
  defaultBookingSections,
  defaultChatSections,
  defaultContactSections,
  defaultFleetSections,
  defaultHomeSections,
  defaultSiteMeta,
  parseBlogSections,
  parseBookingSections,
  parseChatSections,
  parseContactSections,
  parseFleetSections,
  parseHomeSections,
  parseSiteMeta,
} from "./site-cms";

export const queryKeys = {
  branding: ["branding"] as const,
  vehicles: (status?: string) => ["vehicles", status ?? "all"] as const,
  vehicle: (id: string) => ["vehicle", id] as const,
  branches: ["branches"] as const,
  testimonials: ["testimonials"] as const,
  blogs: ["blogs"] as const,
  blog: (slug: string) => ["blog", slug] as const,
  destinations: ["destinations"] as const,
  destination: (slug: string) => ["destination", slug] as const,
  services: ["services"] as const,
  team: ["team"] as const,
  aboutPage: ["about-page"] as const,
  destinationsPage: ["destinations-page"] as const,
  servicesPage: ["services-page"] as const,
  homePage: ["home-page"] as const,
  fleetPage: ["fleet-page"] as const,
  contactPage: ["contact-page"] as const,
  bookingPage: ["booking-page"] as const,
  blogPage: ["blog-page"] as const,
  chatPage: ["chat-page"] as const,
  siteMeta: ["site-meta"] as const,
  termsPage: ["terms-page"] as const,
  myBookings: ["my-bookings"] as const,
  myBooking: (id: string) => ["my-booking", id] as const,
};

function useStructuredCmsPage<T>(
  queryKey: readonly unknown[],
  pageKey: string,
  parse: (raw: string | null | undefined) => T,
  defaults: () => T,
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const page = await api.getCmsPage(pageKey);
      const sections = page.published ? parse(page.content) : defaults();
      return { page, sections, usingCms: page.published };
    },
    staleTime: 60_000,
  });
}

export function useBranding() {
  return useQuery({
    queryKey: queryKeys.branding,
    queryFn: () => api.getBranding(),
    staleTime: 5 * 60_000,
  });
}

export function useVehicles(status?: string) {
  return useQuery({
    queryKey: queryKeys.vehicles(status),
    queryFn: () => api.getVehicles({ status, limit: 200 }),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useVehicle(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vehicle(id ?? ""),
    queryFn: () => api.getVehicle(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useBranches() {
  return useQuery({
    queryKey: queryKeys.branches,
    queryFn: () => api.getBranches(),
    staleTime: 5 * 60_000,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: queryKeys.testimonials,
    queryFn: () => api.getTestimonials(),
    staleTime: 5 * 60_000,
  });
}

export function useBlogs() {
  return useQuery({
    queryKey: queryKeys.blogs,
    queryFn: async () => {
      const posts = await api.getBlogs();
      return posts.map((post) => ({ ...post, slug: blogCanonicalSlug(post) }));
    },
    staleTime: 60_000,
  });
}

export function useBlog(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.blog(slug ?? ""),
    queryFn: async () => {
      const ref = blogCanonicalSlug({ slug: slug! });
      const post = await api.getBlogBySlug(ref);
      return { ...post, slug: blogCanonicalSlug(post) };
    },
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}

export function useDestinations() {
  return useQuery({
    queryKey: queryKeys.destinations,
    queryFn: () => api.getDestinations(100),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useDestination(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.destination(slug ?? ""),
    queryFn: () => api.getDestinationBySlug(slug!),
    enabled: Boolean(slug?.trim()),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useServiceCards() {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: () => api.getServiceCards(),
    staleTime: 5 * 60_000,
  });
}

export function useTeam() {
  return useQuery({
    queryKey: queryKeys.team,
    queryFn: () => api.getTeam(),
    staleTime: 5 * 60_000,
  });
}

export function useAboutPage() {
  return useStructuredCmsPage(queryKeys.aboutPage, "about", parseAboutSections, defaultAboutSections);
}

export function useDestinationsPage() {
  return useStructuredCmsPage(
    queryKeys.destinationsPage,
    "destinations",
    parseDestinationsSections,
    defaultDestinationsSections,
  );
}

export function useServicesPage() {
  return useStructuredCmsPage(
    queryKeys.servicesPage,
    "service",
    parseServicesSections,
    defaultServicesSections,
  );
}

export function useHomePage() {
  return useStructuredCmsPage(queryKeys.homePage, "home", parseHomeSections, defaultHomeSections);
}

export function useFleetPage() {
  return useStructuredCmsPage(queryKeys.fleetPage, "fleet", parseFleetSections, defaultFleetSections);
}

export function useContactPage() {
  return useStructuredCmsPage(queryKeys.contactPage, "contact", parseContactSections, defaultContactSections);
}

export function useBookingPage() {
  return useStructuredCmsPage(queryKeys.bookingPage, "booking", parseBookingSections, defaultBookingSections);
}

export function useBlogPage() {
  return useStructuredCmsPage(queryKeys.blogPage, "blog", parseBlogSections, defaultBlogSections);
}

export function useChatPage() {
  return useStructuredCmsPage(queryKeys.chatPage, "chat", parseChatSections, defaultChatSections);
}

export function useSiteMetaPage() {
  return useStructuredCmsPage(queryKeys.siteMeta, "site_meta", parseSiteMeta, defaultSiteMeta);
}

export function useTermsPage() {
  return useQuery({
    queryKey: queryKeys.termsPage,
    queryFn: async () => {
      const page = await api.getCmsPage("terms");
      return {
        page,
        html: page.published ? page.content ?? "" : "",
        usingCms: page.published,
      };
    },
    staleTime: 60_000,
  });
}

export function useContactMutation() {
  return useMutation({
    mutationFn: (payload: ContactPayload) => api.submitContact(payload),
  });
}

export function useDestinationBookingMutation() {
  return useMutation({
    mutationFn: (payload: PublicDestinationBookingPayload) => api.submitDestinationBooking(payload),
  });
}

export function useBookingMutation() {
  return useMutation({
    mutationFn: (payload: PublicBookingPayload) => api.submitBooking(payload),
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: queryKeys.myBookings,
    queryFn: () => api.getMyBookings(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMyBooking(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.myBooking(id ?? ""),
    queryFn: () => api.getMyBooking(id!),
    enabled: Boolean(id?.trim()),
    staleTime: 15_000,
  });
}

export function useUpdateMyVehicleBookingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MyVehicleBookingUpdatePayload }) =>
      api.updateMyVehicleBooking(id, payload),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.myBookings });
      void qc.invalidateQueries({ queryKey: queryKeys.myBooking(id) });
    },
  });
}

export function useUpdateMyDestinationBookingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MyDestinationBookingUpdatePayload }) =>
      api.updateMyDestinationBooking(id, payload),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.myBookings });
      void qc.invalidateQueries({ queryKey: queryKeys.myBooking(id) });
    },
  });
}
