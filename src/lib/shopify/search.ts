/**
 * Builds a Shopify Storefront search `query` string for the catalog/category
 * search UIs, combining an optional product-type filter with optional free
 * text. Both inputs are sanitized before being embedded — `text` in
 * particular comes straight from a user-controlled search box, so special
 * characters that have meaning in Shopify's search syntax (`:`, `'`, `"`,
 * parentheses, boolean operators) are stripped rather than escaped.
 */
export function buildProductSearchQuery({
  category,
  text,
}: {
  category?: string | null;
  text?: string | null;
}): string | undefined {
  const parts: string[] = [];

  const sanitizedCategory = sanitizeTerm(category);
  if (sanitizedCategory) {
    parts.push(`product_type:'${sanitizedCategory}'`);
  }

  const sanitizedText = sanitizeTerm(text);
  if (sanitizedText) {
    parts.push(sanitizedText);
  }

  return parts.length > 0 ? parts.join(" AND ") : undefined;
}

function sanitizeTerm(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .slice(0, 100);
}
