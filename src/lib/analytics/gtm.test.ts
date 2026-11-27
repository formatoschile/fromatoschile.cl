/// <reference types="bun" />

import { afterEach, describe, expect, test } from "bun:test";

import { CONSENT_BOOTSTRAP_SNIPPET } from "@/lib/consent/consent";

import { buildGtmSnippet } from "./gtm";

const realWindow = globalThis.window;
const realDocument = globalThis.document;

afterEach(() => {
  Object.assign(globalThis, { window: realWindow, document: realDocument });
});

/** Runs the layout's two inline scripts, in layout order, on a fake page. */
function runLayoutScripts(containerId: string) {
  const inserted: { src: string; async: boolean }[] = [];
  const firstScript = {
    parentNode: {
      insertBefore: (script: { src: string; async: boolean }) => {
        inserted.push(script);
      },
    },
  };
  Object.assign(globalThis, {
    window: {},
    document: {
      cookie: "",
      getElementsByTagName: () => [firstScript],
      createElement: () => ({ src: "", async: false }),
    },
  });

  // oxlint-disable-next-line no-new-func -- executing our own snippets, as the browser does
  new Function(CONSENT_BOOTSTRAP_SNIPPET)();
  // oxlint-disable-next-line no-new-func -- ditto
  new Function(buildGtmSnippet({ containerId }) ?? "")();

  const { window: fakeWindow } = globalThis as unknown as {
    window: { dataLayer: unknown[] };
  };
  return { dataLayer: fakeWindow.dataLayer, inserted };
}

describe("buildGtmSnippet", () => {
  test("loads the container asynchronously from Google", () => {
    const { inserted } = runLayoutScripts("GTM-WQN2XMW4");

    expect(inserted).toEqual([
      {
        src: "https://www.googletagmanager.com/gtm.js?id=GTM-WQN2XMW4",
        async: true,
      },
    ]);
  });

  test("the consent default comes before GTM's start event", () => {
    const { dataLayer } = runLayoutScripts("GTM-WQN2XMW4");

    const first = Array.from(dataLayer[0] as ArrayLike<unknown>);
    expect(first.slice(0, 2)).toEqual(["consent", "default"]);
    expect(dataLayer.at(-1)).toMatchObject({ event: "gtm.js" });
  });

  test.each(["", "G-JTP6VGESGM", "GTM-abc", "GTM-1'); alert(1); ('"])(
    "refuses %p without throwing — no GTM rather than a broken page",
    (containerId) => {
      expect(buildGtmSnippet({ containerId })).toBeNull();
    }
  );
});
