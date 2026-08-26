import type { Route } from "next";
import type { ReadonlyURLSearchParams } from "next/navigation";

const PRODUCTION_URL = "https://formatos.cl";

export const baseUrl = getBaseUrl();

// This module is also bundled into client components (e.g. CartItem's
// createUrl), so it can't import the validated `env` module — t3-env's
// server-only accessor throws at runtime when touched from client code.
function getBaseUrl() {
  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_URL;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return "http://localhost:3000";
}

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams
): Route => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}` as Route;
};

export const ensureStartsWith = (
  stringToCheck: string,
  startsWith: string
): string =>
  stringToCheck.startsWith(startsWith)
    ? stringToCheck
    : `${startsWith}${stringToCheck}`;
