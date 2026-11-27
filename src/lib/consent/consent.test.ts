/// <reference types="bun" />

import { describe, expect, test } from "bun:test";

import {
  buildConsentBootstrapSnippet,
  CONSENT_BOOTSTRAP_SNIPPET,
  CONSENT_REQUIRED,
  consentStateFrom,
  type ConsentChoices,
  isStandingRecord,
  parseConsentRecord,
  readStoredChoices,
  CONSENT_MAX_AGE,
  REFUSAL_MAX_AGE,
  REJECTION_MAX_AGE,
  REPROMPT_BELOW_VERSION,
  UNANSWERED_CHOICES,
} from "./consent";

const COMBINATIONS: ConsentChoices[] = [
  { analytics: false, advertising: false },
  { analytics: true, advertising: false },
  { analytics: false, advertising: true },
  { analytics: true, advertising: true },
];

/**
 * The two fallbacks, passed explicitly wherever a test is about a *rule*
 * rather than about the live switch.
 *
 * CONSENT_REQUIRED (src/lib/utils/consent.ts) decides which of them production
 * uses, and the firm flips it. A rule test that read the live constant would
 * start testing the switch instead the day it moves — and worse, would have to
 * be edited to flip it back, which is the one thing reverting must not need.
 */
const DENIED: ConsentChoices = { analytics: false, advertising: false };
const GRANTED: ConsentChoices = { analytics: true, advertising: true };

/** Runs the inline snippet against a stub window, returning what it pushed. */
function runSnippet(
  cookie: string,
  snippet: string = CONSENT_BOOTSTRAP_SNIPPET
): unknown[] {
  const stubWindow: { dataLayer: unknown[] } = { dataLayer: [] };

  new Function("window", "document", snippet)(stubWindow, { cookie });

  return stubWindow.dataLayer;
}

/** Points the module-level reader at a cookie string. */
function withDocumentCookie(cookie: string, run: () => void): void {
  const realDocument = globalThis.document;
  Object.assign(globalThis, { document: { cookie } });
  try {
    run();
  } finally {
    Object.assign(globalThis, { document: realDocument });
  }
}

function cookieFor(choices: ConsentChoices, extra: object = {}): string {
  const record = {
    necessary: true,
    analytics: choices.analytics,
    advertising: choices.advertising,
    timestamp: new Date().toISOString(),
    // The current shape. Raised with CONSENT_VERSION and
    // REPROMPT_BELOW_VERSION on 24 September 2026; a cookie below the gate is
    // denied, so leaving this at 2 would have quietly turned every test below
    // into a test of the re-prompt instead of what it says it checks.
    version: 3,
    ...extra,
  };

  return `cookie-consent=${encodeURIComponent(JSON.stringify(record))}`;
}

describe("consentStateFrom", () => {
  test("maps advertising onto all three ad types together", () => {
    const state = consentStateFrom({ analytics: false, advertising: true });

    expect(state.ad_storage).toBe("granted");
    expect(state.ad_user_data).toBe("granted");
    expect(state.ad_personalization).toBe("granted");
    expect(state.analytics_storage).toBe("denied");
  });

  test("declares all seven types, because an omitted one counts as granted", () => {
    const state = consentStateFrom({ analytics: false, advertising: false });

    expect(Object.keys(state).toSorted()).toEqual(
      [
        "ad_personalization",
        "ad_storage",
        "ad_user_data",
        "analytics_storage",
        "functionality_storage",
        "personalization_storage",
        "security_storage",
      ].toSorted()
    );
  });

  test("the three types no choice moves never move", () => {
    for (const choices of COMBINATIONS) {
      const state = consentStateFrom(choices);

      expect(state.functionality_storage).toBe("granted");
      expect(state.security_storage).toBe("granted");
      expect(state.personalization_storage).toBe("denied");
    }
  });
});

describe("CONSENT_BOOTSTRAP_SNIPPET", () => {
  /**
   * The snippet is a second implementation of consentStateFrom, written in
   * ES5 because it runs before any module script. Two implementations of one rule
   * drift, so this is the test that stops them.
   */
  test("agrees with consentStateFrom for every combination", () => {
    for (const choices of COMBINATIONS) {
      const [command] = runSnippet(cookieFor(choices)) as Array<
        [string, string, Record<string, string>]
      >;

      expect(command[0]).toBe("consent");
      expect(command[1]).toBe("default");
      expect({ ...command[2] }).toEqual({ ...consentStateFrom(choices) });
    }
  });

  test("the consent default is the first thing in the dataLayer", () => {
    const pushed = runSnippet("") as Array<[string, string]>;

    expect(pushed[0][0]).toBe("consent");
    expect(pushed[0][1]).toBe("default");
  });

  test("sets ads_data_redaction and url_passthrough", () => {
    const pushed = runSnippet("") as Array<[string, string, boolean]>;
    const sets = pushed.filter((command) => command[0] === "set");

    expect(sets).toHaveLength(2);
    expect(Object.fromEntries(sets.map((s) => [s[1], s[2]]))).toEqual({
      ads_data_redaction: true,
      url_passthrough: true,
    });
  });

  test("denies everything for an unanswered visitor, when consent is required", () => {
    const [command] = runSnippet(
      "",
      buildConsentBootstrapSnippet(REPROMPT_BELOW_VERSION, DENIED)
    ) as Array<[string, string, Record<string, string>]>;

    expect({ ...command[2] }).toEqual({ ...consentStateFrom(DENIED) });
  });

  /**
   * A record written before phase 3 has no `advertising` key. It must read as
   * declined rather than as undefined-and-therefore-whatever.
   *
   * Read at a threshold of 0 rather than through the live constant, which
   * denies such a record outright — the test below. Two separate rules, and
   * this one has to keep working on its own.
   */
  test("a record from before the advertising category reads as declined", () => {
    const legacy = `cookie-consent=${encodeURIComponent(
      JSON.stringify({
        necessary: true,
        analytics: true,
        timestamp: new Date().toISOString(),
      })
    )}`;

    const [command] = runSnippet(
      legacy,
      buildConsentBootstrapSnippet(0)
    ) as Array<[string, string, Record<string, string>]>;

    expect(command[2].analytics_storage).toBe("granted");
    expect(command[2].ad_storage).toBe("denied");
    expect(command[2].ad_user_data).toBe("denied");
    expect(command[2].ad_personalization).toBe("denied");
  });

  /**
   * The live gate, as opposed to the parameterised ones below: a record below
   * REPROMPT_BELOW_VERSION buys nothing.
   */
  test("the shipped snippet ignores a record below the re-prompt version", () => {
    const [command] = runSnippet(
      cookieFor(
        { analytics: true, advertising: true },
        { version: REPROMPT_BELOW_VERSION - 1 }
      )
    ) as Array<[string, string, Record<string, string>]>;

    // Ignored means "as if they had never answered" — which is the fallback,
    // denied or granted depending on CONSENT_REQUIRED. What matters is that
    // the record itself buys nothing.
    expect({ ...command[2] }).toEqual({
      ...consentStateFrom(UNANSWERED_CHOICES),
    });
  });

  test("a truthy-but-not-true advertising value is still declined", () => {
    const [command] = runSnippet(
      cookieFor(
        { analytics: false, advertising: false },
        { advertising: "yes" }
      )
    ) as Array<[string, string, Record<string, string>]>;

    expect(command[2].ad_storage).toBe("denied");
  });

  test("survives a cookie it cannot parse", () => {
    const pushed = runSnippet("cookie-consent=not%20json%20at%20all");

    expect(pushed).toHaveLength(3);
    expect((pushed[0] as string[])[1]).toBe("default");
  });

  test("finds its cookie among others", () => {
    const [command] = runSnippet(
      `_ga=GA1.1.x; ${cookieFor({ analytics: true, advertising: true })}; other=1`
    ) as Array<[string, string, Record<string, string>]>;

    expect(command[2].ad_storage).toBe("granted");
  });

  test("runs once, so the fallback call cannot double-push", () => {
    const stubWindow: { dataLayer: unknown[] } = { dataLayer: [] };
    const document = { cookie: "" };

    new Function("window", "document", CONSENT_BOOTSTRAP_SNIPPET)(
      stubWindow,
      document
    );
    new Function("window", "document", CONSENT_BOOTSTRAP_SNIPPET)(
      stubWindow,
      document
    );

    expect(stubWindow.dataLayer).toHaveLength(3);
  });

  /**
   * REPROMPT_BELOW_VERSION has to bite here too, not only in the banner. When
   * it did not, raising it brought the banner back for a version 1 record
   * while this snippet went on sending the record's grants as the default —
   * Google was told yes by a visitor the UI was treating as un-asked.
   */
  test("a record below the re-prompt version grants nothing", () => {
    const legacy = `cookie-consent=${encodeURIComponent(
      JSON.stringify({
        necessary: true,
        analytics: true,
        timestamp: new Date().toISOString(),
      })
    )}`;

    const [command] = runSnippet(
      legacy,
      buildConsentBootstrapSnippet(2, DENIED)
    ) as Array<[string, string, Record<string, string>]>;

    expect({ ...command[2] }).toEqual({ ...consentStateFrom(DENIED) });
  });

  test("a record at the re-prompt version still counts", () => {
    const [command] = runSnippet(
      cookieFor({ analytics: true, advertising: true }),
      buildConsentBootstrapSnippet(2, DENIED)
    ) as Array<[string, string, Record<string, string>]>;

    expect(command[2].analytics_storage).toBe("granted");
    expect(command[2].ad_storage).toBe("granted");
  });

  test("pushes an arguments object, not an array — GTM checks", () => {
    const [command] = runSnippet("");

    // The whole mechanism hinges on this: a literal array is merged into the
    // data model and silently ignored as a command.
    expect(Array.isArray(command)).toBe(false);
    expect(Object.prototype.toString.call(command)).toBe("[object Arguments]");
  });
});

describe("readStoredChoices", () => {
  test("reads a current record", () => {
    withDocumentCookie(
      cookieFor({ analytics: true, advertising: false }),
      () => {
        expect(readStoredChoices()).toEqual({
          analytics: true,
          advertising: false,
        });
      }
    );
  });

  test("no cookie is denied, when consent is required", () => {
    withDocumentCookie("", () => {
      expect(readStoredChoices(REPROMPT_BELOW_VERSION, DENIED)).toEqual(DENIED);
    });
  });

  /**
   * The same gate the snippet applies, in the reader the site's own cookies
   * and the fallback default go through. Without it, `hasAdvertisingConsent`
   * kept writing advertising cookies for a record the banner had stopped honouring.
   */
  test("a record below the re-prompt version is denied", () => {
    const legacy = `cookie-consent=${encodeURIComponent(
      JSON.stringify({
        necessary: true,
        analytics: true,
        timestamp: new Date().toISOString(),
      })
    )}`;

    withDocumentCookie(legacy, () => {
      expect(readStoredChoices(2, DENIED)).toEqual(DENIED);
      expect(readStoredChoices(0, DENIED).analytics).toBe(true);
    });
  });

  test("agrees with the snippet for every combination", () => {
    for (const choices of COMBINATIONS) {
      withDocumentCookie(cookieFor(choices), () => {
        const [command] = runSnippet(cookieFor(choices)) as Array<
          [string, string, Record<string, string>]
        >;

        expect({ ...command[2] }).toEqual({
          ...consentStateFrom(readStoredChoices()),
        });
      });
    }
  });
});

/**
 * The banner-less mode, tested at both positions of the switch rather than at
 * whichever one is live — so that flipping CONSENT_REQUIRED back is a one-line
 * change with no test to edit alongside it.
 */
describe("CONSENT_REQUIRED", () => {
  const grantedSnippet = buildConsentBootstrapSnippet(
    REPROMPT_BELOW_VERSION,
    GRANTED
  );

  test("off: a visitor who has not answered is granted both", () => {
    const [command] = runSnippet("", grantedSnippet) as Array<
      [string, string, Record<string, string>]
    >;

    expect({ ...command[2] }).toEqual({ ...consentStateFrom(GRANTED) });

    withDocumentCookie("", () => {
      expect(readStoredChoices(REPROMPT_BELOW_VERSION, GRANTED)).toEqual(
        GRANTED
      );
    });
  });

  /**
   * The regression this mode exists one bug away from.
   *
   * The snippet used to raise `a`/`d` from the fallback — `if (p.analytics ===
   * true) a = 'granted'` — which reads a stored `false` as "no information"
   * and leaves the fallback standing. Correct while the fallback was denied,
   * and silently wrong the moment it is not: someone who rejected through the
   * footer panel would have been granted anyway, on every page load, with the
   * UI showing their refusal. A stored record is now read as written.
   */
  test("off: an explicit rejection is still honoured", () => {
    const rejection = cookieFor(DENIED);

    const [command] = runSnippet(rejection, grantedSnippet) as Array<
      [string, string, Record<string, string>]
    >;

    expect({ ...command[2] }).toEqual({ ...consentStateFrom(DENIED) });

    withDocumentCookie(rejection, () => {
      expect(readStoredChoices(REPROMPT_BELOW_VERSION, GRANTED)).toEqual(
        DENIED
      );
    });
  });

  test("off: a partial choice is read as made, not widened", () => {
    const partial: ConsentChoices = { analytics: true, advertising: false };

    const [command] = runSnippet(cookieFor(partial), grantedSnippet) as Array<
      [string, string, Record<string, string>]
    >;

    expect({ ...command[2] }).toEqual({ ...consentStateFrom(partial) });
  });

  test("on: the banner's mode is unchanged", () => {
    const [command] = runSnippet(
      "",
      buildConsentBootstrapSnippet(REPROMPT_BELOW_VERSION, DENIED)
    ) as Array<[string, string, Record<string, string>]>;

    expect({ ...command[2] }).toEqual({ ...consentStateFrom(DENIED) });
  });

  /**
   * The snippet ships as a string built at module load, and the provider reads
   * the same constant at runtime. Nothing else keeps the two in step, so this
   * is what catches a flag that was flipped in one place only.
   */
  test("the shipped snippet matches the live flag", () => {
    const [command] = runSnippet("") as Array<
      [string, string, Record<string, string>]
    >;

    expect({ ...command[2] }).toEqual({
      ...consentStateFrom(UNANSWERED_CHOICES),
    });

    expect(UNANSWERED_CHOICES).toEqual(CONSENT_REQUIRED ? DENIED : GRANTED);
  });
});

const DAY_MS = 86_400_000;

function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

describe("parseConsentRecord", () => {
  test("reads a current record", () => {
    const raw = JSON.stringify({
      analytics: true,
      advertising: false,
      timestamp: "2026-10-01T10:00:00.000Z",
      version: 1,
    });

    expect(parseConsentRecord(raw)).toEqual({
      analytics: true,
      advertising: false,
      timestamp: "2026-10-01T10:00:00.000Z",
      version: 1,
    });
  });

  test("a missing version is the legacy shape", () => {
    expect(
      parseConsentRecord(JSON.stringify({ analytics: true, timestamp: "x" }))
        ?.version
    ).toBe(0);
  });

  test.each([
    "",
    "not json",
    "null",
    "42",
    JSON.stringify({ analytics: true }),
  ])("%p is not a record", (raw) => {
    expect(parseConsentRecord(raw)).toBeNull();
  });
});

/**
 * One rule for whether a stored answer still counts, applied by the snippet
 * (Google's default) and by readStoredChoices (the site's own cookies and the
 * banner). When the two disagreed, a record one reader honoured and the other
 * ignored told Google one thing and the site another about the same visitor.
 */
const record = (choices: ConsentChoices, timestamp: string) => ({
  ...choices,
  timestamp,
  version: REPROMPT_BELOW_VERSION,
});

/** The standing-record rule with the banner ON: refusals kept 30 days. */
function bannerOn(stored: ReturnType<typeof record>): boolean {
  return isStandingRecord(
    stored,
    REPROMPT_BELOW_VERSION,
    Date.now(),
    REJECTION_MAX_AGE
  );
}

describe("isStandingRecord", () => {
  test("banner on: a refusal lapses after thirty days, an acceptance does not", () => {
    expect(bannerOn(record(DENIED, daysAgo(31)))).toBe(false);
    expect(bannerOn(record(DENIED, daysAgo(20)))).toBe(true);
    expect(isStandingRecord(record(GRANTED, daysAgo(200)))).toBe(true);
    expect(isStandingRecord(record(GRANTED, daysAgo(400)))).toBe(false);
  });

  test("the live refusal lifetime follows CONSENT_REQUIRED", () => {
    expect(REFUSAL_MAX_AGE).toBe(
      CONSENT_REQUIRED ? REJECTION_MAX_AGE : CONSENT_MAX_AGE
    );
  });

  test("an unparsable timestamp does not count", () => {
    expect(isStandingRecord(record(GRANTED, "yesterday-ish"))).toBe(false);
  });

  const CASES: Array<[string, string]> = [
    ["a fresh refusal", cookieFor(DENIED)],
    ["a lapsed refusal", cookieFor(DENIED, { timestamp: daysAgo(31) })],
    ["an old acceptance", cookieFor(GRANTED, { timestamp: daysAgo(200) })],
    ["an expired acceptance", cookieFor(GRANTED, { timestamp: daysAgo(400) })],
    ["no timestamp", cookieFor(DENIED, { timestamp: undefined })],
    ["a numeric timestamp", cookieFor(DENIED, { timestamp: Date.now() })],
  ];

  test.each(CASES)(
    "the snippet and readStoredChoices agree on %s",
    (_, cookie) => {
      for (const unanswered of [DENIED, GRANTED]) {
        withDocumentCookie(cookie, () => {
          const [command] = runSnippet(
            cookie,
            buildConsentBootstrapSnippet(REPROMPT_BELOW_VERSION, unanswered)
          ) as Array<[string, string, Record<string, string>]>;

          expect({ ...command[2] }).toEqual({
            ...consentStateFrom(
              readStoredChoices(REPROMPT_BELOW_VERSION, unanswered)
            ),
          });
        });
      }
    }
  );
});
