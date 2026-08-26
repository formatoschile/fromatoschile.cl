"use client";

import { useEffect, useState, useTransition } from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import type { ProductCard } from "@/lib/shopify/types";
import { classNames } from "@/lib/utils/classNames";

import { loadMoreDocuments } from "../../_components/actions";
import { DocumentCard } from "../../_components/DocumentCard";
import { SearchInput } from "../../_components/SearchInput";

const SEARCH_DEBOUNCE_MS = 400;

interface CategoryCatalogProps {
  categoryTitle: string;
  query: string;
  initialProducts: ProductCard[];
  initialHasNextPage: boolean;
  initialEndCursor: string | null;
}

export const CategoryCatalog: React.FC<CategoryCatalogProps> = ({
  categoryTitle,
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

  // Debounce the search box before pushing it to the URL (and re-fetching).
  useEffect(() => {
    if (searchText === query) return;

    const timeout = setTimeout(() => {
      const search = new URLSearchParams();
      if (searchText) search.set("q", searchText);

      const queryString = search.toString();
      startTransition(() => {
        router.push(
          (queryString ? `${pathname}?${queryString}` : pathname) as Route
        );
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchText, query, pathname, router, startTransition]);

  const handleLoadMore = async () => {
    if (!endCursor) return;

    setIsLoadingMore(true);
    const nextPage = await loadMoreDocuments({
      category: categoryTitle,
      text: query || null,
      after: endCursor,
    });
    setProducts((current) => [...current, ...nextPage.products]);
    setHasNextPage(nextPage.hasNextPage);
    setEndCursor(nextPage.endCursor);
    setIsLoadingMore(false);
  };

  return (
    <div className={classNames({ "opacity-60": isPending })}>
      <div className="mt-10">
        <SearchInput
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      {products.length ? (
        <>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
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
          {query
            ? "No encontramos documentos para tu búsqueda."
            : "No hay documentos en esta colección."}
        </p>
      )}
    </div>
  );
};
