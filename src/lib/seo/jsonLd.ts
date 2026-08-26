import type {
  BreadcrumbList,
  FAQPage,
  Organization,
  Product as ProductJsonLd,
  WebSite,
  WithContext,
} from "schema-dts";

import { env } from "@/env";
import type { Product } from "@/lib/shopify/types";
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

export function buildProductJsonLd(
  product: Product
): WithContext<ProductJsonLd> {
  const availability = product.availableForSale
    ? ("https://schema.org/InStock" as const)
    : ("https://schema.org/OutOfStock" as const);
  const { minVariantPrice, maxVariantPrice } = product.priceRange;
  const isSinglePrice = minVariantPrice.amount === maxVariantPrice.amount;

  const offers = isSinglePrice
    ? {
        "@type": "Offer" as const,
        availability,
        priceCurrency: minVariantPrice.currencyCode,
        price: minVariantPrice.amount,
      }
    : {
        "@type": "AggregateOffer" as const,
        availability,
        priceCurrency: minVariantPrice.currencyCode,
        highPrice: maxVariantPrice.amount,
        lowPrice: minVariantPrice.amount,
      };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    sku: product.variants[0]?.sku,
    url: `${baseUrl}/product/${product.handle}`,
    brand: { "@type": "Brand", name: env.SITE_NAME },
    offers,
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
