/// <reference types="bun" />

import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { cookieDomainsFor } from "./cookies";
import { clearGoogleCookies, googleCookiesToClear } from "./googleCookies";

const NAMES = [
  "_ga",
  "_ga_HE87DHS09F",
  "_gcl_au",
  "_gcl_aw",
  "_gcl_dc",
  "_fbp",
  "_fbc",
  "fc_landing",
  "cookie-consent",
  "cartId",
  "gclid",
  "_gat",
];

describe("googleCookiesToClear", () => {
  test("refusing everything clears Analytics and Ads cookies only", () => {
    expect(
      googleCookiesToClear({
        names: NAMES,
        choices: { analytics: false, advertising: false },
      })
    ).toEqual([
      "_ga",
      "_ga_HE87DHS09F",
      "_gcl_au",
      "_gcl_aw",
      "_gcl_dc",
      "_fbp",
      "_fbc",
      "fc_landing",
    ]);
  });

  test("each category clears only its own cookies", () => {
    expect(
      googleCookiesToClear({
        names: NAMES,
        choices: { analytics: false, advertising: true },
      })
    ).toEqual(["_ga", "_ga_HE87DHS09F"]);
    expect(
      googleCookiesToClear({
        names: NAMES,
        choices: { analytics: true, advertising: false },
      })
    ).toEqual(["_gcl_au", "_gcl_aw", "_gcl_dc", "_fbp", "_fbc", "fc_landing"]);
  });

  test("granting both clears nothing", () => {
    expect(
      googleCookiesToClear({
        names: NAMES,
        choices: { analytics: true, advertising: true },
      })
    ).toEqual([]);
  });
});

describe("cookieDomainsFor", () => {
  test("the host and each parent, never the bare TLD", () => {
    expect(cookieDomainsFor("www.formatoschile.cl")).toEqual([
      "www.formatoschile.cl",
      "formatoschile.cl",
    ]);
  });

  test("localhost and IP addresses take host-only cookies", () => {
    expect(cookieDomainsFor("localhost")).toEqual([]);
    expect(cookieDomainsFor("127.0.0.1")).toEqual([]);
  });
});

/**
 * A jar keyed by name and domain, the way a browser keys it: Google's cookies
 * live on `.formatoschile.cl`, and an expiry without the matching Domain
 * attribute leaves them in place.
 */
function domainAwareJar(initial: Array<[string, string]>) {
  const jar = new Map(
    initial.map(([name, domain]) => [`${name}@${domain}`, name])
  );

  return {
    jar,
    get cookie() {
      return [...jar.values()].map((name) => `${name}=1`).join("; ");
    },
    set cookie(header: string) {
      const [pair, ...attributes] = header.split("; ");
      const name = pair.split("=")[0];
      const domain =
        attributes.find((a) => a.startsWith("Domain="))?.slice(7) ?? "host";
      if (attributes.includes("Max-Age=0")) jar.delete(`${name}@${domain}`);
    },
  };
}

const realWindow = globalThis.window;
const realDocument = globalThis.document;
let fake: ReturnType<typeof domainAwareJar>;

beforeEach(() => {
  fake = domainAwareJar([
    ["_ga", "formatoschile.cl"],
    ["_ga_HE87DHS09F", "formatoschile.cl"],
    ["_gcl_au", "formatoschile.cl"],
    ["cookie-consent", "host"],
  ]);
  Object.assign(globalThis, {
    window: {
      location: { protocol: "https:", hostname: "www.formatoschile.cl" },
    },
  });
  Object.assign(globalThis, { document: fake });
});

afterEach(() => {
  Object.assign(globalThis, { window: realWindow });
  Object.assign(globalThis, { document: realDocument });
});

describe("clearGoogleCookies", () => {
  test("removes cookies Google wrote on the registrable domain", () => {
    clearGoogleCookies({ analytics: false, advertising: false });

    expect([...fake.jar.keys()]).toEqual(["cookie-consent@host"]);
  });

  test("keeps what is still allowed", () => {
    clearGoogleCookies({ analytics: true, advertising: false });

    expect([...fake.jar.keys()]).toEqual([
      "_ga@formatoschile.cl",
      "_ga_HE87DHS09F@formatoschile.cl",
      "cookie-consent@host",
    ]);
  });
});
