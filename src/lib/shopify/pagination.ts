import type { Connection } from "./types";

// 100 edges/page (Shopify's connection cap) × this bound is far beyond any
// realistic catalog size — guards against an infinite loop if a cursor ever
// fails to terminate (e.g. `hasNextPage` stuck `true`).
const MAX_PAGES = 500;

/**
 * Shopify connections cap a single page at 100 edges. Loops the given fetcher
 * with the previous page's cursor until `hasNextPage` is false, so callers
 * get the full result set instead of silently only the first 100 items.
 */
export async function fetchAllPages<T>(
  fetchPage: (after: string | undefined) => Promise<Connection<T>>
): Promise<Connection<T>["edges"]> {
  const edges: Connection<T>["edges"] = [];
  let after: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await fetchPage(after);
    edges.push(...result.edges);

    if (!result.pageInfo?.hasNextPage) {
      return edges;
    }
    after = result.pageInfo.endCursor ?? undefined;
  }

  throw new Error(
    `fetchAllPages exceeded ${MAX_PAGES} pages without exhausting hasNextPage`
  );
}
