"use client";

import { useEffect } from "react";

import { forgetCampaign } from "@/components/cart/actions";
import { captureLanding, snapshotPage } from "@/lib/attribution/captureLanding";
import { hasAdvertisingConsent } from "@/lib/consent/consent";
import { CONSENT_CHANGE_EVENT } from "@/lib/consent/store";

/**
 * Records the visitor's landing for the order's campaign attributes
 * (src/lib/attribution), once per full page load, and keeps it in step with
 * advertising consent:
 *
 * - with consent at load, the landing is captured straight away;
 * - without it (the banner is still unanswered), it is captured the moment
 *   consent is granted, from the URL and referrer the page loaded with — the
 *   common "land, accept, buy" path keeps its campaign;
 * - when consent is withdrawn, forgetCampaign blanks the attributes already
 *   on the cart (the cookie itself is deleted by the refusal).
 *
 * Reacts to transitions only: CONSENT_CHANGE_EVENT also fires on focus and
 * when another tab syncs, with nothing changed.
 */
export function useCaptureLanding(): void {
  useEffect(() => {
    const page = snapshotPage();
    let hasConsent = hasAdvertisingConsent();
    let isCaptured = hasConsent && captureLanding({ page });

    const handleConsentChange = () => {
      const isGranted = hasAdvertisingConsent();
      if (isGranted === hasConsent) return;
      hasConsent = isGranted;

      if (!isGranted) {
        void forgetCampaign();
        return;
      }
      if (!isCaptured) {
        isCaptured = captureLanding({ page });
      }
    };

    document.addEventListener(CONSENT_CHANGE_EVENT, handleConsentChange);
    return () => {
      document.removeEventListener(CONSENT_CHANGE_EVENT, handleConsentChange);
    };
  }, []);
}
