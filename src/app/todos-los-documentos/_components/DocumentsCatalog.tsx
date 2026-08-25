"use client";

import { useState } from "react";

import { classNames } from "@/lib/utils/classNames";

import { DocumentCard } from "./DocumentCard";
import { DocumentModal } from "./DocumentModal";
import { FeaturedCard } from "./FeaturedCard";
import type { DocItem } from "./types";
import { useDocumentFilters } from "./useDocumentFilters";

interface DocumentsCatalogProps {
  docs: DocItem[];
  initialCategory?: string | null;
}

export const DocumentsCatalog: React.FC<DocumentsCatalogProps> = ({
  docs,
  initialCategory = null,
}) => {
  const [selected, setSelected] = useState<DocItem | null>(null);
  const {
    query,
    setQuery,
    categories,
    selectedCategory,
    toggleCategory,
    filteredDocs,
  } = useDocumentFilters(docs, initialCategory);

  const handleClose = () => setSelected(null);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  if (!docs.length) {
    return (
      <p className="mt-12 text-sm text-neutral-500">
        No hay documentos disponibles por el momento.
      </p>
    );
  }

  const [featured, ...rest] = filteredDocs;

  return (
    <>
      {/* Search */}
      <div className="mt-10">
        <input
          type="search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Buscar documentos..."
          aria-label="Buscar documentos"
          className="h-14 w-full rounded-full border border-neutral-200 bg-white px-6 text-sm text-neutral-700 shadow-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400"
        />
      </div>

      {/* Category filters */}
      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
        {categories.map((category) => (
          <button
            key={category.label}
            type="button"
            onClick={() => toggleCategory(category.label)}
            aria-pressed={selectedCategory === category.label}
            className={classNames(
              "text-xs uppercase tracking-widest transition-colors hover:text-ink",
              {
                "font-semibold text-ink underline underline-offset-4":
                  selectedCategory === category.label,
                "text-neutral-500": selectedCategory !== category.label,
              }
            )}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {featured ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeaturedCard doc={featured} onSelect={() => setSelected(featured)} />

          {rest.map((doc) => (
            <DocumentCard
              key={doc.handle}
              doc={doc}
              onSelect={() => setSelected(doc)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-sm text-neutral-500">
          No encontramos documentos para tu búsqueda.
        </p>
      )}

      <DocumentModal doc={selected} onClose={handleClose} />
    </>
  );
};
