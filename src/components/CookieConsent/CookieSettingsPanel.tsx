"use client";

import { useState } from "react";
import { DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import type { ConsentChoices } from "@/lib/consent/consent";
import { classNames } from "@/lib/utils/classNames";

import { useConsent } from "./ConsentContext";
import { ConsentSwitch } from "./ConsentSwitch";

const BUTTON_CLASSES =
  "w-full cursor-pointer rounded-full px-6 py-2.5 text-sm transition-opacity hover:opacity-85 md:w-auto";

// TODO(copy): placeholder descriptions — the client writes the final wording
// from docs/cookie-inventory.md (tracking plan, phase 3).
interface ConsentCategory {
  key: keyof ConsentChoices;
  title: string;
  description: string;
}

const CATEGORIES: ConsentCategory[] = [
  {
    key: "analytics",
    title: "Cookies de análisis",
    description:
      "Nos permiten entender cómo se usa el sitio: qué documentos se consultan, si se lee la vista previa y en qué paso se abandona la compra. Utilizamos Google Analytics.",
  },
  {
    key: "advertising",
    title: "Cookies de publicidad",
    description:
      "Nos permiten saber qué anuncio trajo a cada visitante y medir si nuestras campañas venden, además de mostrar anuncios relevantes en Google y Meta (Facebook e Instagram).",
  },
];

/**
 * The settings panel itself. Mounted only while the dialog is open, so its
 * draft switches start from what is in force at the moment of opening.
 */
export const CookieSettingsPanel: React.FC = () => {
  const { choices, closeSettings, acceptAll, rejectAll, savePreferences } =
    useConsent();
  const [draft, setDraft] = useState<ConsentChoices>(choices);

  const handleToggle = (name: string) => {
    const key = name as keyof ConsentChoices;
    setDraft((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleSave = () => {
    savePreferences(draft);
  };

  return (
    <DialogPanel className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="border-ink/10 bg-mist flex items-start justify-between gap-4 border-b px-6 py-4">
        <div>
          <DialogTitle className="text-ink text-2xl">
            Configuración de cookies
          </DialogTitle>
          <p className="mt-1 text-sm text-neutral-600">
            Elige qué cookies permites. Puedes cambiarlo cuando quieras desde el
            pie de página.
          </p>
        </div>
        {/* Closing is not a decision about cookies, so it is an X here
            rather than a "Cancelar" next to the three real choices. */}
        <button
          type="button"
          onClick={closeSettings}
          aria-label="Cerrar sin guardar"
          className="text-ink -mr-2 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-neutral-200"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto px-6 py-6">
        <div className="border-ink/10 bg-mist rounded-xl border p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-ink font-medium">Cookies necesarias</p>
              <p className="mt-1 text-sm text-neutral-600">
                Imprescindibles para que el sitio funcione: guardan tu carrito y
                tu elección sobre cookies. No pueden desactivarse.
              </p>
            </div>
            <ConsentSwitch
              label="Cookies necesarias, siempre activas"
              isChecked
              isDisabled
            />
          </div>
        </div>

        {CATEGORIES.map(({ key, title, description }) => (
          <div key={key} className="border-ink/10 rounded-xl border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-ink font-medium">{title}</p>
                <p
                  id={`consent-${key}-description`}
                  className="mt-1 text-sm text-neutral-600"
                >
                  {description}
                </p>
              </div>
              <ConsentSwitch
                label={title}
                descriptionId={`consent-${key}-description`}
                name={key}
                isChecked={draft[key]}
                onToggle={handleToggle}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reject and accept share a style so their weight is not a matter of
          opinion; reject is first in the DOM, so first when stacked. */}
      <div className="border-ink/10 bg-mist flex flex-col justify-end gap-2 border-t px-6 py-4 md:flex-row">
        <button
          type="button"
          onClick={rejectAll}
          className={classNames(BUTTON_CLASSES, "bg-ink text-white")}
        >
          Rechazar todas
        </button>
        <button
          type="button"
          onClick={handleSave}
          className={classNames(
            BUTTON_CLASSES,
            "border-ink text-ink border bg-white"
          )}
        >
          Guardar preferencias
        </button>
        <button
          type="button"
          onClick={acceptAll}
          className={classNames(BUTTON_CLASSES, "bg-ink text-white")}
        >
          Aceptar todas
        </button>
      </div>
    </DialogPanel>
  );
};
