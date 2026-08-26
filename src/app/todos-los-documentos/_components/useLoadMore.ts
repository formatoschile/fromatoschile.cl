"use client";

import { useState } from "react";

interface LoadMoreResult<T> {
  products: T[];
  hasNextPage: boolean;
  endCursor: string | null;
}

interface UseLoadMoreOptions<T> {
  initialProducts: T[];
  initialHasNextPage: boolean;
  initialEndCursor: string | null;
  loadMore: (after: string) => Promise<LoadMoreResult<T>>;
}

interface UseLoadMoreResult<T> {
  products: T[];
  hasNextPage: boolean;
  isLoadingMore: boolean;
  handleLoadMore: () => Promise<void>;
}

/** Shared "load more" pagination state for the catalog and category listings. */
export function useLoadMore<T>({
  initialProducts,
  initialHasNextPage,
  initialEndCursor,
  loadMore,
}: UseLoadMoreOptions<T>): UseLoadMoreResult<T> {
  const [products, setProducts] = useState(initialProducts);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [endCursor, setEndCursor] = useState(initialEndCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (!endCursor) return;

    setIsLoadingMore(true);
    const nextPage = await loadMore(endCursor);
    setProducts((current) => [...current, ...nextPage.products]);
    setHasNextPage(nextPage.hasNextPage);
    setEndCursor(nextPage.endCursor);
    setIsLoadingMore(false);
  };

  return { products, hasNextPage, isLoadingMore, handleLoadMore };
}
