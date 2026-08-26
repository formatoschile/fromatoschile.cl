import type { Connection } from "./types";

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

  for (;;) {
    const page = await fetchPage(after);
    edges.push(...page.edges);

    if (!page.pageInfo?.hasNextPage) {
      break;
    }
    after = page.pageInfo.endCursor ?? undefined;
  }

  return edges;
}
