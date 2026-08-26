"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import type { Collection, ProductCard } from "@/lib/shopify/types";
import { classNames } from "@/lib/utils/classNames";

import { loadMoreDocuments } from "./actions";
import { DocumentCard } from "./DocumentCard";
import { FeaturedCard } from "./FeaturedCard";
import { SearchInput } from "./SearchInput";

const SEARCH_DEBOUNCE_MS = 400;

interface DocumentsCatalogProps {
  categories: Collection[];
  selectedCategory: string | null;
  query: string;
  initialProducts: ProductCard[];
  initialHasNextPage: boolean;
  initialEndCursor: string | null;
}

export const DocumentsCatalog: React.FC<DocumentsCatalogProps> = ({
  categories,
  selectedCategory,
  query,
  initialProducts,
  initialHasNextPage,
  initialEndCursor,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [searchText, setSearchText] = useState(query);
  const [products, setProducts] = useState(initialProducts);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [endCursor, setEndCursor] = useState(initialEndCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const navigateTo = useCallback(
    (params: { categoria: string | null; q: string | null }) => {
      const search = new URLSearchParams();
      if (params.categoria) search.set("categoria", params.categoria);
      if (params.q) search.set("q", params.q);

      const queryString = search.toString();
      startTransition(() => {
        router.push(
          (queryString ? `${pathname}?${queryString}` : pathname) as Route
        );
      });
    },
    [pathname, router, startTransition]
  );

  // Debounce the search box before pushing it to the URL (and re-fetching).
  useEffect(() => {
    if (searchText === query) return;

    const timeout = setTimeout(() => {
      navigateTo({ categoria: selectedCategory, q: searchText || null });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchText, query, selectedCategory, navigateTo]);

  const handleToggleCategory = (category: string) => {
    navigateTo({
      categoria: selectedCategory === category ? null : category,
      q: searchText || null,
    });
  };

  const handleLoadMore = async () => {
    if (!endCursor) return;

    setIsLoadingMore(true);
    const nextPage = await loadMoreDocuments({
      category: selectedCategory,
      text: query || null,
      after: endCursor,
    });
    setProducts((current) => [...current, ...nextPage.products]);
    setHasNextPage(nextPage.hasNextPage);
    setEndCursor(nextPage.endCursor);
    setIsLoadingMore(false);
  };

  const [featured, ...rest] = products;

  return (
    <div className={classNames({ "opacity-60": isPending })}>
      {/* Search */}
      <div className="mt-10">
        <SearchInput
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      {/* Category filters */}
      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
        <button
          type="button"
          onClick={() => handleToggleCategory("")}
          aria-pressed={!selectedCategory}
          className={classNames(
            "cursor-pointer text-xs uppercase tracking-widest transition-colors hover:text-ink",
            {
              "font-semibold text-ink underline underline-offset-4":
                !selectedCategory,
              "text-neutral-500": Boolean(selectedCategory),
            }
          )}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category.handle}
            type="button"
            onClick={() => handleToggleCategory(category.title)}
            aria-pressed={selectedCategory === category.title}
            className={classNames(
              "cursor-pointer text-xs uppercase tracking-widest transition-colors hover:text-ink",
              {
                "font-semibold text-ink underline underline-offset-4":
                  selectedCategory === category.title,
                "text-neutral-500": selectedCategory !== category.title,
              }
            )}
          >
            {category.title}
          </button>
        ))}
      </div>

      {featured ? (
        <>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeaturedCard product={featured} />

            {rest.map((product) => (
              <DocumentCard key={product.handle} product={product} />
            ))}
          </div>

          {hasNextPage ? (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="border-ink text-ink hover:bg-ink cursor-pointer rounded-full border px-6 py-3 text-sm tracking-wide transition-colors hover:text-white disabled:cursor-wait disabled:opacity-60"
              >
                {isLoadingMore ? "Cargando…" : "Cargar más"}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="mt-12 text-sm text-neutral-500">
          No encontramos documentos para tu búsqueda.
        </p>
      )}
    </div>
  );
};
