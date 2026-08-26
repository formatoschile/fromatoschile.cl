"use client";

import { useCallback } from "react";

import type { ProductCard } from "@/lib/shopify/types";
import { classNames } from "@/lib/utils/classNames";

import { loadMoreDocuments } from "../../_components/actions";
import { DocumentCard } from "../../_components/DocumentCard";
import { LoadMoreButton } from "../../_components/LoadMoreButton";
import { SearchInput } from "../../_components/SearchInput";
import { useDebouncedSearch } from "../../_components/useDebouncedSearch";
import { useLoadMore } from "../../_components/useLoadMore";

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
  const { searchText, setSearchText, isPending } = useDebouncedSearch({
    query,
    buildParams: useCallback((text: string) => ({ q: text || null }), []),
  });

  const { products, hasNextPage, isLoadingMore, handleLoadMore } = useLoadMore({
    initialProducts,
    initialHasNextPage,
    initialEndCursor,
    loadMore: (after) =>
      loadMoreDocuments({
        category: categoryTitle,
        text: query || null,
        after,
      }),
  });

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
            <LoadMoreButton
              isLoading={isLoadingMore}
              onClick={handleLoadMore}
            />
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
