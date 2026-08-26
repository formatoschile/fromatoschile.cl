import type {
  BreadcrumbList,
  FAQPage,
  Organization,
  WebSite,
  WithContext,
} from "schema-dts";

import { env } from "@/env";
import { baseUrl } from "@/lib/utils";

const ORGANIZATION_ID = `${baseUrl}/#organization`;

export function buildOrganizationJsonLd(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: env.SITE_NAME,
    url: baseUrl,
    logo: `${baseUrl}/logo/logo_green_small.png`,
    sameAs: ["https://rykabogados.cl"],
  };
}

export function buildWebSiteJsonLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: env.SITE_NAME,
    url: baseUrl,
    inLanguage: "es-CL",
    publisher: {
      "@id": ORGANIZATION_ID,
    },
  };
}

export function buildFaqJsonLd(
  faqs: { title: string; description: string }[]
): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.description,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[]
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}
