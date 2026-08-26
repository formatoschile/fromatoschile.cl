"use client";

import type { Collection, ProductCard } from "@/lib/shopify/types";
import { classNames } from "@/lib/utils/classNames";

import { loadMoreDocuments } from "./actions";
import { DocumentCard } from "./DocumentCard";
import { FeaturedCard } from "./FeaturedCard";
import { LoadMoreButton } from "./LoadMoreButton";
import { SearchInput } from "./SearchInput";
import { useDebouncedSearch } from "./useDebouncedSearch";
import { useLoadMore } from "./useLoadMore";

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
  const { searchText, setSearchText, isPending, navigateTo } =
    useDebouncedSearch({
      query,
      buildParams: (text: string) => ({
        categoria: selectedCategory,
        q: text || null,
      }),
    });

  const { products, hasNextPage, isLoadingMore, handleLoadMore } = useLoadMore({
    initialProducts,
    initialHasNextPage,
    initialEndCursor,
    loadMore: (after) =>
      loadMoreDocuments({
        category: selectedCategory,
        text: query || null,
        after,
      }),
  });

  const handleToggleCategory = (category: string) => {
    navigateTo({
      categoria: selectedCategory === category ? null : category,
      q: searchText || null,
    });
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
            <LoadMoreButton
              isLoading={isLoadingMore}
              onClick={handleLoadMore}
            />
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
