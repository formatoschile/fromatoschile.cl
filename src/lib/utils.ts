import { ReadonlyURLSearchParams } from "next/navigation";

export const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

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

const priceFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "EUR",
  currencyDisplay: "narrowSymbol",
});

export function formatPrice(price: number | string) {
  if (typeof price === "string") {
    return priceFormatter.format(parseFloat(price));
  }

  return priceFormatter.format(price);
}
