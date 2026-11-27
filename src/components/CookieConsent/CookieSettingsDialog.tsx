"use client";

import { Dialog } from "@headlessui/react";

import { useConsent } from "./ConsentContext";
import { CookieSettingsPanel } from "./CookieSettingsPanel";

/**
 * Second-layer settings. Opened from the banner's "Personalizar" or the
 * footer's "Configurar cookies". Mounted only while open, so the switches are
 * seeded fresh each time from what is actually in force — with
 * CONSENT_REQUIRED off that is "granted" for a visitor who never answered,
 * and the switches say so rather than claiming nothing is tracked.
 */
export const CookieSettingsDialog: React.FC = () => {
  const { isSettingsOpen, closeSettings } = useConsent();

  return (
    <Dialog
      open={isSettingsOpen}
      onClose={closeSettings}
      className="relative z-50"
    >
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px]"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <CookieSettingsPanel />
      </div>
    </Dialog>
  );
};
