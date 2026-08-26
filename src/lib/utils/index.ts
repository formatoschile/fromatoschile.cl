import { ReadonlyURLSearchParams } from "next/navigation";

const PRODUCTION_URL = "https://formatos.cl";

export const baseUrl = getBaseUrl();

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
) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  // @TODO Eventually convert to RoutImpl or something
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return `${pathname}${queryString}` as any;
};

export const ensureStartsWith = (stringToCheck: string, startsWith: string) =>
  stringToCheck.startsWith(startsWith)
    ? stringToCheck
    : `${startsWith}${stringToCheck}`;
