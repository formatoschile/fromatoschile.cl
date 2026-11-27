export interface CookieConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
  timestamp: string;
  /** The shape this record was written in. See REPROMPT_BELOW_VERSION in ./consent.ts. */
  version: number;
}
