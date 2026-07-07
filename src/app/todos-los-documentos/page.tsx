import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

import { DocumentsCatalog } from "./_components/DocumentsCatalog";

export const metadata = {
  title: "Todos los documentos",
  description:
    "Encuentra el contrato o documento legal que necesitas, redactado conforme a la normativa chilena.",
};

const categories = [
  { label: "Laboral", count: 15 },
  { label: "Inmobiliario", count: 12 },
  { label: "Sociedades", count: 18 },
  { label: "Comercial", count: 20 },
  { label: "Civil", count: 14 },
  { label: "Legal", count: 10 },
  { label: "Mercantil", count: 16 },
];

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      <h1 className="text-4xl text-neutral-800 sm:text-5xl">
        Encuentra tu Documento Legal
      </h1>

      {/* Search + filter */}
      <div className="mt-10 flex items-center gap-4">
        <input
          type="search"
          placeholder="Buscar documentos..."
          className="h-14 w-full rounded-full border border-neutral-200 bg-white px-6 text-sm text-neutral-700 shadow-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <button
          type="button"
          aria-label="Filtros"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Category filters */}
      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
        {categories.map((category) => (
          <button
            key={category.label}
            type="button"
            className="text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-neutral-800"
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      <DocumentsCatalog />
    </div>
  );
}
