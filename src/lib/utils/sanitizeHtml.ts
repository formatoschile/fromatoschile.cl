import { cacheLife } from "next/cache";
import { sanitize } from "isomorphic-dompurify";

/**
 * isomorphic-dompurify's server-side sanitize touches `Date` internally,
 * which Next's Cache Components prerendering flags as an unstable value
 * unless the call is wrapped in its own `"use cache"` boundary.
 */
export async function sanitizeHtml(html: string): Promise<string> {
  "use cache";
  cacheLife("days");

  return sanitize(html);
}
