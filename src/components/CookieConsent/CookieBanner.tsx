"use client";

import { classNames } from "@/lib/utils/classNames";

import { useConsent } from "./ConsentContext";

const BUTTON_CLASSES =
  "w-full cursor-pointer rounded-full px-6 py-2.5 text-sm transition-opacity hover:opacity-85 sm:w-auto";

/**
 * First-layer banner. Shown only to a visitor with no standing answer while
 * CONSENT_REQUIRED is on (or with `?consent-preview` in development).
 *
 * Not role="dialog": it is non-modal, traps no focus and the page stays usable
 * behind it. Reject and accept carry the same style so neither is the easier
 * button (RK followed the EDPB's 2023 cookie-banner taskforce on this; keep
 * it). "Personalizar" is first in the DOM, so it tops the stack on a phone.
 */
export const CookieBanner: React.FC = () => {
  const { isBannerVisible, openSettings, acceptAll, rejectAll } = useConsent();

  if (!isBannerVisible) return null;

  return (
    <section
      aria-labelledby="cookie-banner-title"
      className="border-ink/10 fixed inset-x-0 bottom-0 z-40 border-t bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between lg:px-16">
        <div className="max-w-3xl">
          <h2 id="cookie-banner-title" className="text-ink text-lg">
            Usamos cookies
          </h2>
          {/* TODO(copy): placeholder wording — the client writes the final
              text and the cookie policy page it should link to (tracking
              plan, phase 3). */}
          <p className="mt-1 text-sm text-neutral-600">
            Utilizamos cookies propias y de terceros para analizar el uso del
            sitio y medir nuestras campañas. Puedes aceptarlas todas,
            rechazarlas todas o elegir cuáles permitir en «Personalizar».
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={openSettings}
            className={classNames(
              BUTTON_CLASSES,
              "border-ink text-ink border bg-white"
            )}
          >
            Personalizar
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className={classNames(BUTTON_CLASSES, "bg-ink text-white")}
          >
            Rechazar todas
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className={classNames(BUTTON_CLASSES, "bg-ink text-white")}
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </section>
  );
};
