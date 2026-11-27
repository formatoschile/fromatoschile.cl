"use client";

import { createContext, use } from "react";

import { CookieBanner } from "./CookieBanner";
import { CookieSettingsDialog } from "./CookieSettingsDialog";
import type { ConsentController } from "./useConsentController";
import { useConsentController } from "./useConsentController";

const ConsentContext = createContext<ConsentController | null>(null);

interface ConsentProviderProps {
  children: React.ReactNode;
}

/**
 * Owns the cookie banner and the settings dialog, and lets anything below it
 * open the dialog (the footer's "Configurar cookies"). Mount once, in the
 * root layout. Logic lives in src/lib/consent; this is only the UI.
 */
export const ConsentProvider: React.FC<ConsentProviderProps> = ({
  children,
}) => {
  const controller = useConsentController();

  return (
    <ConsentContext value={controller}>
      {children}
      <CookieBanner />
      <CookieSettingsDialog />
    </ConsentContext>
  );
};

export function useConsent(): ConsentController {
  const context = use(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
}
