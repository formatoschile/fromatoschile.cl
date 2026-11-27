/// <reference types="bun" />

import { describe, expect, test } from "bun:test";

import type { LandingContext } from "./landing";
import {
  cartAttributesFromLanding,
  hasCampaignParams,
  landingFromLocation,
  mergeLanding,
  parseLanding,
  serializeLanding,
} from "./landing";

const NOW = new Date("2026-11-27T15:00:00.000Z");
const SITE = "https://www.formatoschile.cl";

function landingAt({
  path,
  referrer = "",
}: {
  path: string;
  referrer?: string;
}): LandingContext {
  const landing = landingFromLocation({
    href: SITE + path,
    referrer,
    now: NOW,
  });
  if (!landing) throw new Error("expected a landing");
  return landing;
}

describe("landingFromLocation", () => {
  test("reads the path and every campaign parameter", () => {
    const landing = landingAt({
      path: "/product/contrato?utm_source=google&utm_medium=cpc&utm_campaign=arriendo&gclid=abc&q=x#top",
    });

    expect(landing).toEqual({
      landing: "/product/contrato",
      landedAt: "2026-11-27T15:00:00.000Z",
      params: {
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "arriendo",
        gclid: "abc",
      },
    });
  });

  test("keeps an external referrer as origin + path, without its query", () => {
    const landing = landingAt({
      path: "/",
      referrer: "https://www.google.com/search?q=contrato+arriendo",
    });

    expect(landing.referrer).toBe("https://www.google.com/search");
  });

  test.each([
    "https://www.formatoschile.cl/catalogo",
    "https://checkout.formatoschile.cl/checkouts/cn/abc",
    "https://formatoschile.cl/",
    "",
    "not a url",
  ])("drops a same-site or unusable referrer: %p", (referrer) => {
    expect(landingAt({ path: "/", referrer })).not.toHaveProperty("referrer");
  });

  test("returns null for an unparseable URL", () => {
    expect(
      landingFromLocation({ href: "nope", referrer: "", now: NOW })
    ).toBeNull();
  });
});

describe("mergeLanding", () => {
  const organic = landingAt({ path: "/" });
  const adClick = landingAt({ path: "/product/a?gclid=one" });
  const newsletter = landingAt({
    path: "/catalogo?utm_source=newsletter&utm_medium=email",
  });

  test("stores a bare first landing, so an organic visit is recorded", () => {
    expect(hasCampaignParams(organic)).toBe(false);
    expect(mergeLanding({ stored: null, incoming: organic })).toEqual(organic);
  });

  test("a campaign landing replaces a bare one", () => {
    expect(mergeLanding({ stored: organic, incoming: adClick })).toEqual(
      adClick
    );
  });

  test("a later bare landing never overwrites a campaign", () => {
    expect(mergeLanding({ stored: adClick, incoming: organic })).toBeNull();
  });

  test("a new campaign landing replaces the previous campaign", () => {
    expect(mergeLanding({ stored: adClick, incoming: newsletter })).toEqual(
      newsletter
    );
  });
});

describe("parseLanding", () => {
  const landing = landingAt({
    path: "/?utm_source=meta&fbclid=xyz",
    referrer: "https://l.facebook.com/l.php?u=secret",
  });

  test("round-trips, raw or URI-encoded", () => {
    const json = serializeLanding(landing);

    expect(parseLanding(json)).toEqual(landing);
    expect(parseLanding(encodeURIComponent(json))).toEqual(landing);
  });

  test.each([undefined, "", "{", "[]", '"x"', '{"landing":1,"landedAt":"x"}'])(
    "rejects %p",
    (raw) => {
      expect(parseLanding(raw)).toBeNull();
    }
  );

  test("drops unknown parameters and non-string values", () => {
    const parsed = parseLanding(
      JSON.stringify({
        landing: "/",
        landedAt: "2026-11-27T15:00:00.000Z",
        referrer: 42,
        params: { utm_source: "ok", evil: "x", gclid: { nested: true } },
      })
    );

    expect(parsed).toEqual({
      landing: "/",
      landedAt: "2026-11-27T15:00:00.000Z",
      params: { utm_source: "ok" },
    });
  });
});

describe("cartAttributesFromLanding", () => {
  test("fixed underscore keys, empty values left out", () => {
    const landing = landingAt({
      path: "/product/a?utm_source=google&utm_campaign=arriendo&gbraid=g1",
      referrer: "https://www.google.com/",
    });

    expect(cartAttributesFromLanding({ landing })).toEqual([
      { key: "_landing", value: "/product/a" },
      { key: "_referrer", value: "https://www.google.com/" },
      { key: "_landed_at", value: "2026-11-27T15:00:00.000Z" },
      { key: "_utm_source", value: "google" },
      { key: "_utm_campaign", value: "arriendo" },
      { key: "_gbraid", value: "g1" },
    ]);
  });

  test("strips control characters, trims and caps at 255", () => {
    const parsed = parseLanding(
      JSON.stringify({
        landing: "/",
        landedAt: "2026-11-27T15:00:00.000Z",
        params: {
          utm_campaign: "  spring\u0000\nsale\u007f  ",
          utm_content: "x".repeat(400),
          utm_term: "\u0001\u0002",
        },
      })
    );
    const attributes = cartAttributesFromLanding({ landing: parsed });

    expect(attributes).toContainEqual({
      key: "_utm_campaign",
      value: "springsale",
    });
    expect(
      attributes.find(({ key }) => key === "_utm_content")?.value
    ).toHaveLength(255);
    expect(attributes.map(({ key }) => key)).not.toContain("_utm_term");
  });

  test("nothing stored, nothing attached", () => {
    expect(cartAttributesFromLanding({ landing: null })).toEqual([]);
  });
});
