"use client";

import { useRef } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import type { Route } from "next";
import Link from "next/link";

import { classNames } from "@/lib/classNames";

interface Template {
  title: string;
  category: string;
  categoryClassName: string;
  features: string[];
  price: string;
  href: Route;
}

const templates: Template[] = [
  {
    title: "Contrato de Trabajo Indefinido",
    category: "Laboral",
    categoryClassName: "bg-rose-200 text-rose-800",
    features: [
      "Incluye cláusulas de confidencialidad",
      "Período de prueba incluido",
      "Actualizado 2026",
    ],
    price: "€20.00",
    href: "/todos-los-documentos",
  },
  {
    title: "Contrato de Arrendamiento Vivienda",
    category: "Commercial",
    categoryClassName: "bg-purple-200 text-purple-800",
    features: [
      "Incluye cláusulas de confidencialidad",
      "Período de prueba incluido",
      "Actualizado 2026",
    ],
    price: "€20.00",
    href: "/todos-los-documentos",
  },
  {
    title: "Contrato de Compraventa Mercantil",
    category: "Civil",
    categoryClassName: "bg-teal-200 text-teal-800",
    features: [
      "Incluye cláusulas de confidencialidad",
      "Período de prueba incluido",
      "Actualizado 2026",
    ],
    price: "€20.00",
    href: "/todos-los-documentos",
  },
  {
    title: "Pacto de Socios SL",
    category: "Laboral",
    categoryClassName: "bg-rose-200 text-rose-800",
    features: [
      "Incluye cláusulas de confidencialidad",
      "Período de prueba incluido",
      "Actualizado 2026",
    ],
    price: "€20.00",
    href: "/todos-los-documentos",
  },
  {
    title: "Acuerdo de Confidencialidad",
    category: "Laboral",
    categoryClassName: "bg-rose-200 text-rose-800",
    features: [
      "Incluye cláusulas de confidencialidad",
      "Período de prueba incluido",
      "Actualizado 2026",
    ],
    price: "€20.00",
    href: "/todos-los-documentos",
  },
];

const SCROLL_AMOUNT = 340;

export const FeaturedTemplates = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  };

  const handleNext = () => {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  };

  return (
    <section className="bg-white px-4 py-16 sm:px-12">
      <div className="flex items-center justify-between">
        <h2 className="font-condensed text-3xl text-neutral-800 sm:text-4xl">
          Plantillas destacadas
        </h2>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Anterior"
            onClick={handlePrev}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-400 text-neutral-700 transition-colors hover:bg-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={handleNext}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-400 text-neutral-700 transition-colors hover:bg-white"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-8 flex gap-5 overflow-x-auto pb-4"
      >
        {templates.map((template, index) => (
          <TemplateCard key={`${template.title}-${index}`} template={template} />
        ))}
      </div>

      <Link
        href="/todos-los-documentos"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-800 underline underline-offset-4 hover:text-neutral-950"
      >
        Ver Todos los Documentos <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
};

interface TemplateCardProps {
  template: Template;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const { title, category, categoryClassName, features, price, href } = template;

  return (
    <div className="flex min-h-72 w-72 shrink-0 flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-medium leading-snug text-neutral-800">
        {title}
      </h3>

      <span
        className={classNames(
          "mt-3 inline-block self-start rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-widest",
          categoryClassName
        )}
      >
        {category}
      </span>

      <ul className="mt-4 list-disc space-y-1.5 pl-4 text-xs text-neutral-500">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-lg font-medium text-neutral-800">{price}</span>

        <Link
          href={href}
          className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
        >
          Compra
        </Link>
      </div>
    </div>
  );
};
