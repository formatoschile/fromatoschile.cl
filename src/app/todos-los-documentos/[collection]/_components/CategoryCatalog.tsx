"use client";

import { useTrackItemList } from "@/components/Analytics/useTrackItemList";
import { ITEM_LISTS, toAnalyticsItem } from "@/lib/analytics";
import type { ProductCard } from "@/lib/shopify/types";
import { classNames } from "@/lib/utils/classNames";

import { loadMoreDocuments } from "../../_components/actions";
import { DocumentCard } from "../../_components/DocumentCard";
import { useDebouncedSearch } from "../../_components/hooks/useDebouncedSearch";
import { useLoadMore } from "../../_components/hooks/useLoadMore";
import { useTrackSearch } from "../../_components/hooks/useTrackSearch";
import { LoadMoreButton } from "../../_components/LoadMoreButton";
import { SearchInput } from "../../_components/SearchInput";

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
    buildParams: (text: string) => ({ q: text || null }),
  });

  const { products, hasNextPage, isLoadingMore, handleLoadMore } = useLoadMore({
    resultsKey: query,
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

  const analyticsItems = products.map((product, index) =>
    toAnalyticsItem({ product, listName: ITEM_LISTS.category, index })
  );
  useTrackItemList({
    listName: ITEM_LISTS.category,
    listKey: `${categoryTitle}:${query}`,
    items: analyticsItems,
  });
  useTrackSearch({ query, resultCount: initialProducts.length });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  return (
    <div>
      <div className="mt-10">
        <SearchInput value={searchText} onChange={handleSearchChange} />
      </div>

      {/* Only the results fade while a search loads — not the search box */}
      <div
        className={classNames("transition-opacity", {
          "opacity-60": isPending,
        })}
      >
        {products.length ? (
          <>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, index) => (
                <DocumentCard
                  key={product.handle}
                  product={product}
                  analyticsItem={analyticsItems[index]}
                />
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
    </div>
  );
};
