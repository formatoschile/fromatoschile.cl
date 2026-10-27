import * as Sentry from "@sentry/nextjs";
import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";

import { getCollections, getPages, getProducts } from "@/lib/shopify";
import { baseUrl } from "@/lib/utils";

/**
 * Prerendered and served from the CDN, regenerated in the background at most
 * hourly (`cacheLife("hours")`) and whenever a Shopify webhook revalidates
 * the collections/products/pages tags of the lists below.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries();
}

/**
 * Errors propagate on purpose: a failed regeneration keeps serving the
 * previous sitemap instead of caching one with missing sections.
 */
async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");

  const lastModified = new Date().toISOString();
  const staticRoutes = ["", "/preguntas-frecuentes", "/contacto"].map(
    (path) => ({ url: `${baseUrl}${path}`, lastModified })
  );

  const collectionsPromise = getCollections()
    .then((collections) =>
      collections.map((collection) => ({
        url: `${baseUrl}${collection.path}`,
        lastModified: collection.updatedAt,
      }))
    )
    .catch(reportError({ action: "sitemap:collections" }));

  const productsPromise = getProducts({})
    .then((products) =>
      products.map((product) => ({
        url: `${baseUrl}/product/${product.handle}`,
        lastModified: product.updatedAt,
      }))
    )
    .catch(reportError({ action: "sitemap:products" }));

  const pagesPromise = getPages()
    .then((pages) =>
      pages.map((page) => ({
        url: `${baseUrl}/${page.handle}`,
        lastModified: page.updatedAt,
      }))
    )
    .catch(reportError({ action: "sitemap:pages" }));

  const fetchedRoutes = (
    await Promise.all([collectionsPromise, productsPromise, pagesPromise])
  ).flat();

  return [...staticRoutes, ...fetchedRoutes];
}

function reportError({ action }: { action: string }) {
  return (error: unknown): never => {
    console.error(`Failed to build sitemap (${action}):`, error);
    Sentry.captureException(error, { tags: { action } });
    throw error;
  };
}
