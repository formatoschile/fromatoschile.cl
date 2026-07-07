import type { Route } from "next";
import Link from "next/link";

import { classNames } from "@/lib/classNames";

interface Category {
  label: string;
  tagClassName: string;
  description: string;
  count: number;
  href: Route;
}

const categories: Category[] = [
  {
    label: "Commercial",
    tagClassName: "bg-purple-200 text-purple-800",
    description: "Contratos de trabajo, confidencialidad, finiquitos",
    count: 15,
    href: "/todos-los-documentos",
  },
  {
    label: "Civil",
    tagClassName: "bg-teal-200 text-teal-800",
    description: "Arrendamiento, compraventa, opciones de compra",
    count: 12,
    href: "/todos-los-documentos",
  },
  {
    label: "Laboral",
    tagClassName: "bg-rose-200 text-rose-800",
    description: "Constitución, pactos sociales, acuerdos",
    count: 18,
    href: "/todos-los-documentos",
  },
  {
    label: "Comercial",
    tagClassName: "bg-amber-200 text-amber-800",
    description: "Compraventa, distribución, servicios",
    count: 20,
    href: "/todos-los-documentos",
  },
  {
    label: "Civil",
    tagClassName: "bg-yellow-200 text-yellow-800",
    description: "Préstamos, donaciones, poderes",
    count: 15,
    href: "/todos-los-documentos",
  },
  {
    label: "Legal",
    tagClassName: "bg-green-300 text-green-900",
    description: "Reclamaciones, acuerdos extrajudiciales",
    count: 15,
    href: "/todos-los-documentos",
  },
  {
    label: "Mercantil",
    tagClassName: "bg-violet-200 text-violet-800",
    description: "Joint ventures, acuerdos de inversión",
    count: 10,
    href: "/todos-los-documentos",
  },
];

export const DocumentCategories = () => {
  return (
    <section className="px-4 py-16 sm:px-12">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <h2 className="font-condensed text-3xl text-neutral-800 sm:text-4xl">
          <span className="font-bold">Categorías</span>{" "}
          <span className="font-light">de Documentos</span>
        </h2>

        <p className="max-w-md text-sm text-neutral-500">
          Encuentra el contrato o documento legal que necesitas, organizado por
          área de práctica
        </p>
      </div>

      <div className="mt-10 flex gap-5 overflow-x-auto pb-4">
        {categories.map((category, index) => (
          <CategoryCard key={`${category.label}-${index}`} category={category} />
        ))}
      </div>
    </section>
  );
};

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { label, tagClassName, description, count, href } = category;

  return (
    <div className="flex min-h-40 w-64 shrink-0 flex-col justify-between rounded-xl bg-white p-6 shadow-sm">
      <div>
        <span
          className={classNames(
            "inline-block rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-widest",
            tagClassName
          )}
        >
          {label}
        </span>

        <p className="mt-4 text-sm text-neutral-600">{description}</p>
      </div>

      <Link
        href={href}
        className="mt-6 text-sm font-medium text-neutral-800 underline underline-offset-4 hover:text-neutral-950"
      >
        ver {count} documentos
      </Link>
    </div>
  );
};
