"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

import type { ConsentChoices } from "@/lib/consent/consent";
import { CONSENT_COOKIE_NAME } from "@/lib/consent/consent";
import { readCookie } from "@/lib/consent/cookies";
import {
  acceptAll,
  CONSENT_CHANGE_EVENT,
  consentStateFromCookie,
  rejectAll,
  savePreferences,
} from "@/lib/consent/store";

export interface ConsentController {
  isBannerVisible: boolean;
  isSettingsOpen: boolean;
  /** What is in force now: the stored answer, or the unanswered fallback. */
  choices: ConsentChoices;
  openSettings: () => void;
  closeSettings: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (choices: ConsentChoices) => void;
}

/** Query parameter that shows the banner in development, whatever the flag. */
const PREVIEW_PARAM = "consent-preview";

/**
 * The consent UI's state, wired to the store in src/lib/consent. The source
 * of truth is the `cookie-consent` cookie, read through useSyncExternalStore
 * and re-read on every CONSENT_CHANGE_EVENT; the server renders no banner, so
 * a returning visitor never sees one flash.
 *
 * State is derived from the snapshot value (consentStateFromCookie), never by
 * reading the cookie again during render: the React Compiler memoises calls
 * by their inputs, and a second read would go stale after a choice.
 *
 * Preview: in `next dev`, `?consent-preview` shows the banner even with
 * CONSENT_REQUIRED off, so the design and copy can be reviewed now. Ignored
 * in production builds.
 */
export function useConsentController(): ConsentController {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewDismissed, setIsPreviewDismissed] = useState(false);

  const state = snapshot === null ? null : consentStateFromCookie(snapshot);
  const isPreview =
    snapshot !== null && isPreviewRequested() && !isPreviewDismissed;

  const finish = useCallback(() => {
    setIsPreviewDismissed(true);
    setIsSettingsOpen(false);
  }, []);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
    finish();
  }, [finish]);

  const handleRejectAll = useCallback(() => {
    rejectAll();
    finish();
  }, [finish]);

  const handleSave = useCallback(
    (choices: ConsentChoices) => {
      savePreferences(choices);
      finish();
    },
    [finish]
  );

  return {
    isBannerVisible: Boolean(state?.showBanner) || isPreview,
    isSettingsOpen,
    choices: {
      analytics: state?.hasAnalyticsConsent ?? false,
      advertising: state?.hasAdvertisingConsent ?? false,
    },
    openSettings,
    closeSettings,
    acceptAll: handleAcceptAll,
    rejectAll: handleRejectAll,
    savePreferences: handleSave,
  };
}

function subscribe(onChange: () => void): () => void {
  document.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  return () => document.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
}

// The raw cookie value: a string, so React compares snapshots by value.
function getSnapshot(): string {
  return readCookie(CONSENT_COOKIE_NAME);
}

// Server render: nothing is known, so no banner and nothing shown granted.
function getServerSnapshot(): null {
  return null;
}

function isPreviewRequested(): boolean {
  if (process.env.NODE_ENV !== "development") return false;

  return new URLSearchParams(window.location.search).has(PREVIEW_PARAM);
}
