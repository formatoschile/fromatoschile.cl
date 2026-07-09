import { useMemo, useState } from "react";

import type { DocItem } from "./types";

interface CategoryCount {
  label: string;
  count: number;
}

/** Client-side search + category filtering over the fetched catalog. */
export function useDocumentFilters(
  docs: DocItem[],
  initialCategory: string | null = null
) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory
  );

  const categories = useMemo<CategoryCount[]>(() => {
    const counts = new Map<string, number>();
    for (const doc of docs) {
      counts.set(doc.category, (counts.get(doc.category) ?? 0) + 1);
    }
    return Array.from(counts, ([label, count]) => ({ label, count }));
  }, [docs]);

  const filteredDocs = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    return docs.filter((doc) => {
      if (selectedCategory && doc.category !== selectedCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = normalize(
        [doc.title, doc.category, ...doc.tags].join(" ")
      );
      return haystack.includes(normalizedQuery);
    });
  }, [docs, query, selectedCategory]);

  const toggleCategory = (category: string) => {
    setSelectedCategory((current) => (current === category ? null : category));
  };

  return {
    query,
    setQuery,
    categories,
    selectedCategory,
    toggleCategory,
    filteredDocs,
  };
}

/** Lowercases and strips accents so "sesión" matches "sesion". */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
