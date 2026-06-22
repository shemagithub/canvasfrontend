import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSeoContext } from "@/context/SeoContext";
import {
  useBlog,
  useBranding,
  useDestination,
  useSiteMetaPage,
  useVehicle,
} from "@/lib/api";
import { api } from "@/lib/api/client";
import { applyBrandingFavicon, brandDisplayName } from "@/lib/api/branding-ui";
import { vehicleDisplayName, vehicleImage } from "@/lib/api/vehicles";
import { blogCoverImage } from "@/lib/api/blog-ui";
import { MESSAGING } from "@/constants/messaging";
import {
  applySeo,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildDestinationJsonLd,
  buildOrganizationJsonLd,
  buildVehicleJsonLd,
  buildWebsiteJsonLd,
  defaultOgImage,
  formatPageTitle,
  truncateDescription,
  type SeoPayload,
} from "@/lib/seo";
import {
  CMS_PAGE_KEYS,
  DEFAULT_SEO_KEYWORDS,
  extractBlogSlug,
  extractDestinationSlug,
  extractVehicleId,
  isDynamicRoute,
  matchStaticRoute,
  normalizePath,
} from "@/lib/seo-config";

function useCmsSeo(pageKey: string | undefined) {
  return useQuery({
    queryKey: ["cms-seo", pageKey],
    queryFn: () => api.getCmsPage(pageKey!),
    enabled: Boolean(pageKey),
    staleTime: 60_000,
  });
}

/** Route-aware SEO: title, description, Open Graph, Twitter, canonical, JSON-LD. */
export function SeoHead() {
  const [path] = useLocation();
  const normalizedPath = normalizePath(path);
  const { override } = useSeoContext();
  const { data: branding } = useBranding();
  const { data: siteMetaData } = useSiteMetaPage();

  const vehicleId = extractVehicleId(path);
  const blogSlug = extractBlogSlug(path);
  const destinationSlug = extractDestinationSlug(path);
  const cmsKey = CMS_PAGE_KEYS[normalizedPath];

  const { data: vehicle } = useVehicle(vehicleId);
  const { data: blogPost } = useBlog(blogSlug);
  const { data: destinationRaw } = useDestination(destinationSlug);
  const { data: cmsPage } = useCmsSeo(cmsKey);

  const resolved = useMemo((): SeoPayload & { title: string; description: string } => {
    const brand = brandDisplayName(branding);
    const globalTitle =
      siteMetaData?.sections?.title ||
      MESSAGING.meta.title.replace(/Canvas Tours|NovaCar/gi, brand);
    const globalDesc =
      siteMetaData?.sections?.description ||
      branding?.company?.description?.trim() ||
      MESSAGING.meta.description;

    const staticRoute = matchStaticRoute(normalizedPath);
    const dynamicKind = isDynamicRoute(normalizedPath);
    const defaultImage = defaultOgImage(branding);

    let title = globalTitle;
    let description = globalDesc;
    let image = defaultImage;
    let type: SeoPayload["type"] = "website";
    let noindex = staticRoute?.noindex ?? false;
    let canonicalPath = normalizedPath;
    let jsonLd: SeoPayload["jsonLd"];
    let keywords =
      siteMetaData?.sections?.keywords?.trim() ||
      DEFAULT_SEO_KEYWORDS;
    let imageAlt: string | undefined;

    if (dynamicKind === "404") {
      title = formatPageTitle("Page Not Found", brand);
      description = "The page you are looking for does not exist or has been moved.";
      noindex = true;
    } else if (vehicleId && vehicle) {
      const name = vehicleDisplayName(vehicle);
      title = formatPageTitle(`Rent ${name}`, brand);
      description = truncateDescription(
        `Book the ${name} — ${vehicle.category ?? "rental vehicle"} with ${brand}. ` +
          (vehicle.seats ? `${vehicle.seats} seats. ` : "") +
          (vehicle.daily_rate ? `From ${vehicle.daily_rate}/day.` : ""),
      );
      image = vehicleImage(vehicle) || defaultImage;
      imageAlt = `Rent ${name} in Rwanda`;
      type = "product";
      canonicalPath = `/car-details/${vehicle.id}`;
      jsonLd = [
        buildVehicleJsonLd(vehicle, branding),
        buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Car Rental", path: "/fleet" },
          { name, path: canonicalPath },
        ]),
      ];
    } else if (blogSlug && blogPost) {
      title = formatPageTitle(blogPost.seo_title?.trim() || blogPost.title, brand);
      description = truncateDescription(
        blogPost.seo_description?.trim() ||
          blogPost.excerpt?.trim() ||
          blogPost.content?.replace(/<[^>]+>/g, " ") ||
          globalDesc,
      );
      image = blogCoverImage(blogPost.cover_image_url) || defaultImage;
      imageAlt = blogPost.title;
      type = "article";
      canonicalPath = `/blog/${blogPost.slug}`;
      jsonLd = [
        buildArticleJsonLd(blogPost, branding),
        buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Journal", path: "/blog" },
          { name: blogPost.title, path: canonicalPath },
        ]),
      ];
    } else if (destinationSlug && destinationRaw) {
      title = formatPageTitle(destinationRaw.title, brand);
      description = truncateDescription(
        destinationRaw.description?.trim() ||
          `${destinationRaw.title} — ${destinationRaw.location || "Rwanda"} destination package with ${brand}.`,
      );
      image = destinationRaw.cover_image_url || defaultImage;
      imageAlt = `${destinationRaw.title} — Rwanda tour package`;
      canonicalPath = `/destinations/${destinationRaw.slug || destinationSlug}`;
      jsonLd = [
        buildDestinationJsonLd(destinationRaw, branding),
        buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          { name: destinationRaw.title, path: canonicalPath },
        ]),
      ];
    } else if (staticRoute) {
      title = formatPageTitle(staticRoute.title.replace(/Canvas Tours|NovaCar/gi, brand), brand);
      description = staticRoute.description.replace(/Canvas Tours|NovaCar/gi, brand);
      noindex = staticRoute.noindex ?? false;

      if (cmsPage?.published) {
        if (cmsPage.seo_title?.trim()) title = cmsPage.seo_title.trim();
        if (cmsPage.seo_description?.trim()) description = cmsPage.seo_description.trim();
      }

      if (normalizedPath === "/") {
        jsonLd = [buildOrganizationJsonLd(branding), buildWebsiteJsonLd(branding)];
      } else if (normalizedPath === "/fleet") {
        jsonLd = [
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Car Rental", path: "/fleet" },
          ]),
        ];
      } else if (normalizedPath === "/destinations") {
        jsonLd = [
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Destinations", path: "/destinations" },
          ]),
        ];
      } else if (normalizedPath === "/blog") {
        jsonLd = [
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Travel Journal", path: "/blog" },
          ]),
        ];
      }
    }

    if (override) {
      if (override.title) title = override.title;
      if (override.description) description = override.description;
      if (override.image) image = override.image;
      if (override.type) type = override.type;
      if (override.canonicalPath) canonicalPath = override.canonicalPath;
      if (override.noindex !== undefined) noindex = override.noindex;
      if (override.jsonLd) jsonLd = override.jsonLd;
      if (override.keywords) keywords = override.keywords;
      if (override.imageAlt) imageAlt = override.imageAlt;
    }

    return {
      title,
      description,
      keywords,
      image,
      imageAlt,
      type,
      canonicalPath,
      noindex,
      siteName: brand,
      jsonLd,
    };
  }, [
    branding,
    siteMetaData,
    normalizedPath,
    vehicleId,
    vehicle,
    blogSlug,
    blogPost,
    destinationSlug,
    destinationRaw,
    cmsPage,
    override,
  ]);

  useEffect(() => {
    applySeo(resolved);
  }, [resolved]);

  useEffect(() => {
    applyBrandingFavicon(branding?.logo_url, branding?.updated_at);
  }, [branding?.logo_url, branding?.updated_at]);

  return null;
}
