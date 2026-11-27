export type PageType =
  | "home"
  | "catalog"
  | "category"
  | "product"
  | "faq"
  | "contact"
  | "legal"
  | "other";

const CATALOG_PATH = "/todos-los-documentos";

/**
 * The `page_type` label, derived from the path so callers never pass it.
 * Anything not matched is a Shopify page served by the `[page]` route
 * (terms, privacy, cookies…), hence `legal`.
 */
export function getPageType(pathname: string): PageType {
  if (pathname === "/") return "home";
  if (pathname === CATALOG_PATH) return "catalog";
  if (pathname.startsWith(`${CATALOG_PATH}/`)) return "category";
  if (pathname.startsWith("/product/")) return "product";
  if (pathname === "/preguntas-frecuentes") return "faq";
  if (pathname === "/contacto") return "contact";
  if (/^\/[^/]+$/.test(pathname)) return "legal";
  return "other";
}
