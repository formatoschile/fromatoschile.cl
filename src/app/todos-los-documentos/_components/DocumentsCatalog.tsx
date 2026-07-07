"use client";

import { useState } from "react";

import { classNames } from "@/lib/classNames";

import { DocumentModal } from "./DocumentModal";
import type { DocItem } from "./types";

const featuredDoc: DocItem = {
  title: "Contrato de Prestación de Servicios",
  category: "Laboral",
  pillClassName: "bg-rose-200 text-rose-800",
  barClassName: "bg-rose-300",
  downloads: 1250,
  tags: ["Ámbito del servicio", "Facturación y pagos", "Resolución anticipada"],
};

const documents: DocItem[] = [
  {
    title: "Contrato de Trabajo Indefinido",
    category: "Laboral",
    pillClassName: "bg-rose-200 text-rose-800",
    barClassName: "bg-rose-300",
    downloads: 1250,
    tags: ["Período de prueba", "Confidencialidad", "Jornada laboral"],
  },
  {
    title: "Contrato de Arrendamiento Vivienda",
    category: "Laboral",
    pillClassName: "bg-rose-200 text-rose-800",
    barClassName: "bg-rose-300",
    downloads: 980,
    tags: ["Renta y reajuste", "Garantía", "Término anticipado"],
  },
  {
    title: "Pacto de Socios SL",
    category: "Sociedades",
    pillClassName: "bg-indigo-200 text-indigo-800",
    barClassName: "bg-indigo-300",
    downloads: 1250,
    tags: [
      "Cláusulas de permanencia",
      "Reparto de dividendos",
      "Transmisión participaciones",
    ],
  },
  {
    title: "Acuerdo de Confidencialidad",
    category: "Laboral",
    pillClassName: "bg-rose-200 text-rose-800",
    barClassName: "bg-rose-300",
    downloads: 1500,
    tags: ["Bilateral o unilateral", "Duración", "Anexos incluidos"],
  },
  {
    title: "Contrato de Compraventa Mercantil",
    category: "Commercial",
    pillClassName: "bg-indigo-200 text-indigo-800",
    barClassName: "bg-indigo-300",
    downloads: 870,
    tags: ["Objeto y precio", "Entrega", "Garantías"],
  },
  {
    title: "Estatutos de Sociedad",
    category: "Civil",
    pillClassName: "bg-teal-200 text-teal-800",
    barClassName: "bg-teal-300",
    downloads: 640,
    tags: ["Objeto social", "Administración", "Capital"],
  },
  {
    title: "Poder General",
    category: "Civil",
    pillClassName: "bg-yellow-200 text-yellow-800",
    barClassName: "bg-yellow-300",
    downloads: 720,
    tags: ["Facultades", "Vigencia", "Revocación"],
  },
];

export const DocumentsCatalog = () => {
  const [selected, setSelected] = useState<DocItem | null>(null);

  const handleClose = () => setSelected(null);

  return (
    <>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <FeaturedCard onSelect={() => setSelected(featuredDoc)} />

        {documents.map((doc, index) => (
          <DocumentCard
            key={`${doc.title}-${index}`}
            doc={doc}
            onSelect={() => setSelected(doc)}
          />
        ))}
      </div>

      <DocumentModal doc={selected} onClose={handleClose} />
    </>
  );
};

interface FeaturedCardProps {
  onSelect: () => void;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-neutral-100 transition-shadow hover:shadow-md"
    >
      <h3 className="text-xl leading-snug text-neutral-800">
        {featuredDoc.title}
      </h3>

      <span className="mt-4 inline-block self-start rounded bg-rose-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-rose-800">
        {featuredDoc.category}
      </span>

      <ul className="mt-6 list-disc space-y-2 pl-4 text-sm text-neutral-600">
        {featuredDoc.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between pt-8">
        <span className="text-2xl text-neutral-800">€20.00</span>
        <span className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white">
          Compra
        </span>
      </div>
    </button>
  );
};

interface DocumentCardProps {
  doc: DocItem;
  onSelect: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onSelect }) => {
  const { title, category, pillClassName, barClassName } = doc;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-neutral-100 transition-shadow hover:shadow-md"
    >
      <div className={classNames("h-2.5 w-full", barClassName)} />

      <div className="p-4">
        <div className="flex justify-end">
          <span
            className={classNames(
              "inline-block rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-widest",
              pillClassName
            )}
          >
            {category}
          </span>
        </div>

        <PreviewThumbnail />

        <h3 className="mt-4 min-h-[3rem] text-base leading-snug text-neutral-800">
          {title}
        </h3>

        <p className="mt-2 text-xl text-neutral-800">€20.00</p>
      </div>
    </button>
  );
};

/** Faux document thumbnail — placeholder for the real watermarked preview image. */
const PreviewThumbnail = () => {
  const lineWidths = ["w-11/12", "w-10/12", "w-full", "w-9/12", "w-11/12", "w-8/12"];

  return (
    <div className="mt-2 rounded-md border border-neutral-200 bg-white px-5 py-4">
      <div className="flex items-center justify-center gap-1">
        <span className="h-3 w-3 rounded-sm bg-neutral-300" />
        <span className="h-1.5 w-10 rounded bg-neutral-200" />
      </div>

      <div className="mx-auto mt-3 h-1.5 w-2/3 rounded bg-neutral-300" />

      <div className="mt-4 space-y-1.5">
        {lineWidths.map((width, index) => (
          <div
            key={index}
            className={classNames("h-1 rounded bg-neutral-200", width)}
          />
        ))}
      </div>
    </div>
  );
};
