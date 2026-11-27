"use client";

import { useConsent } from "./ConsentContext";

interface CookieSettingsButtonProps {
  className?: string;
}

/**
 * "Configurar cookies" — opens the settings dialog. Present even while the
 * banner is off (CONSENT_REQUIRED false): it is then the only way to opt out.
 */
export const CookieSettingsButton: React.FC<CookieSettingsButtonProps> = ({
  className,
}) => {
  const { openSettings } = useConsent();

  return (
    <button type="button" onClick={openSettings} className={className}>
      Configurar cookies
    </button>
  );
};
