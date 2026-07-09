const CHILEAN_LOCALE = "es-CL";

/** Formats a Shopify money amount for display (es-CL, e.g. "$20.000"). */
export function formatPrice({
  amount,
  currencyCode,
}: {
  amount: string | number;
  currencyCode: string;
}): string {
  return new Intl.NumberFormat(CHILEAN_LOCALE, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(typeof amount === "string" ? Number(amount) : amount);
}
