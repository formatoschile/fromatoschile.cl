import * as Sentry from "@sentry/nextjs";
import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { getCollections, getPages, getProducts } from "@/lib/shopify";
import { baseUrl } from "@/lib/utils";

/**
 * Rendered per request: `lastModified` reads the current time, which ends a
 * build-time prerender and makes the in-flight `"use cache"` Shopify calls
 * below reject. Opting out up front avoids that; the Shopify lists themselves
 * stay cached by their own `"use cache"` and tags.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

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
    .catch((error) => {
      console.error("Failed to list collections for sitemap:", error);
      Sentry.captureException(error, {
        tags: { action: "sitemap:collections" },
      });
      return [];
    });

  const productsPromise = getProducts({})
    .then((products) =>
      products.map((product) => ({
        url: `${baseUrl}/product/${product.handle}`,
        lastModified: product.updatedAt,
      }))
    )
    .catch((error) => {
      console.error("Failed to list products for sitemap:", error);
      Sentry.captureException(error, { tags: { action: "sitemap:products" } });
      return [];
    });

  const pagesPromise = getPages()
    .then((pages) =>
      pages.map((page) => ({
        url: `${baseUrl}/${page.handle}`,
        lastModified: page.updatedAt,
      }))
    )
    .catch((error) => {
      console.error("Failed to list pages for sitemap:", error);
      Sentry.captureException(error, { tags: { action: "sitemap:pages" } });
      return [];
    });

  const fetchedRoutes = (
    await Promise.all([collectionsPromise, productsPromise, pagesPromise])
  ).flat();

  return [...staticRoutes, ...fetchedRoutes];
}
