"use client";

import { useEffect, useRef, useState } from "react";

interface LoadMoreResult<T> {
  products: T[];
  hasNextPage: boolean;
  endCursor: string | null;
}

interface UseLoadMoreOptions<T> {
  // Identifies the current result set (e.g. category + query); when it
  // changes the list restarts from the new `initialProducts`.
  resultsKey: string;
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
  resultsKey,
  initialProducts,
  initialHasNextPage,
  initialEndCursor,
  loadMore,
}: UseLoadMoreOptions<T>): UseLoadMoreResult<T> {
  const [products, setProducts] = useState(initialProducts);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [endCursor, setEndCursor] = useState(initialEndCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentResultsKey, setCurrentResultsKey] = useState(resultsKey);
  // Read after `await` in `handleLoadMore`, where render values are stale.
  const latestResultsKeyRef = useRef(resultsKey);

  useEffect(() => {
    latestResultsKeyRef.current = resultsKey;
  }, [resultsKey]);

  if (resultsKey !== currentResultsKey) {
    setCurrentResultsKey(resultsKey);
    setProducts(initialProducts);
    setHasNextPage(initialHasNextPage);
    setEndCursor(initialEndCursor);
  }

  const handleLoadMore = async () => {
    if (!endCursor) return;

    const requestedResultsKey = resultsKey;
    setIsLoadingMore(true);
    const nextPage = await loadMore(endCursor);
    setIsLoadingMore(false);

    // The search changed while this page was loading — drop it.
    if (requestedResultsKey !== latestResultsKeyRef.current) return;

    setProducts((current) => [...current, ...nextPage.products]);
    setHasNextPage(nextPage.hasNextPage);
    setEndCursor(nextPage.endCursor);
  };

  return { products, hasNextPage, isLoadingMore, handleLoadMore };
}
