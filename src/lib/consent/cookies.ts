/**
 * First-party cookie helpers for the browser. Every read and write is wrapped:
 * `document.cookie` can throw in sandboxed or opaque-origin documents, and
 * nothing that uses these is worth breaking a page over.
 *
 * Values are URI-encoded on the way in and decoded on the way out, so a read
 * returns exactly what was written.
 */

function secureAttribute(): string {
  try {
    return window.location.protocol === "https:" ? "; Secure" : "";
  } catch {
    return "";
  }
}

/** The decoded value of `name`, or "" when it is missing or unreadable. */
export function readCookie(name: string): string {
  try {
    const prefix = `${name}=`;
    const entry = document.cookie
      .split("; ")
      .find((row) => row.startsWith(prefix));

    return entry ? decodeURIComponent(entry.slice(prefix.length)) : "";
  } catch {
    return "";
  }
}

/** Names of every cookie visible to this page. */
export function cookieNames(): string[] {
  try {
    return document.cookie
      .split("; ")
      .map((row) => row.split("=")[0])
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Writes a host-only cookie on `/`. Not httpOnly and not meant to be: nothing
 * reads these on the server. SameSite=Lax so a click arriving from an ad
 * still carries them.
 */
export function writeCookie(
  name: string,
  value: string,
  maxAgeSeconds: number
): void {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secureAttribute()}`;
  } catch {
    // Storage disabled or blocked — best-effort, never fatal.
  }
}

/**
 * The domains a cookie for `hostname` may have been set on: the host itself
 * and each parent, stopping before the bare TLD. Google's tags write theirs on
 * the highest one the browser accepts (`.formatoschile.cl` for
 * `www.formatoschile.cl`), so expiring only the host-only copy would miss them.
 * Empty for `localhost` and IP addresses, which take host-only cookies only.
 */
export function cookieDomainsFor(hostname: string): string[] {
  if (!hostname.includes(".") || /^[\d.]+$/.test(hostname)) return [];

  const labels = hostname.split(".");
  const domains: string[] = [];
  for (let i = 0; i < labels.length - 1; i++) {
    domains.push(labels.slice(i).join("."));
  }
  return domains;
}

/**
 * Expires `name` wherever this page could have set it: host-only, and on
 * every parent domain from `cookieDomainsFor`. A cookie is identified by name,
 * domain and path, and both the site and Google's tags use `/`.
 */
export function expireCookie(name: string): void {
  try {
    const base = `${name}=; Max-Age=0; Path=/; SameSite=Lax${secureAttribute()}`;
    document.cookie = base;
    for (const domain of cookieDomainsFor(window.location.hostname)) {
      document.cookie = `${base}; Domain=${domain}`;
    }
  } catch {
    // Storage disabled or blocked — nothing was written, so nothing to clear.
  }
}
