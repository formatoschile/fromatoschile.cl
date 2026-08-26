import { MetadataRoute } from "next";

import { getCollections, getPages, getProducts } from "@/lib/shopify";
import { baseUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routesMap = [""].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  const collectionsPromise = getCollections()
    .then((collections) =>
      collections.map((collection) => ({
        url: `${baseUrl}${collection.path}`,
        lastModified: collection.updatedAt,
      }))
    )
    .catch((error) => {
      console.error("Failed to list collections for sitemap:", error);
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
      return [];
    });

  const fetchedRoutes = (
    await Promise.all([collectionsPromise, productsPromise, pagesPromise])
  ).flat();

  return [...routesMap, ...fetchedRoutes];
}
