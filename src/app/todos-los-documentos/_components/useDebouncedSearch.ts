"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

const SEARCH_DEBOUNCE_MS = 400;

type SearchParams = Record<string, string | null>;

interface UseDebouncedSearchOptions {
  query: string;
  buildParams: (searchText: string) => SearchParams;
}

interface UseDebouncedSearchResult {
  searchText: string;
  setSearchText: (value: string) => void;
  isPending: boolean;
  navigateTo: (params: SearchParams) => void;
}

/**
 * Debounces the catalog/category search box before pushing it to the URL
 * (and re-fetching), and exposes `navigateTo` for filters that should push
 * immediately (e.g. a category toggle) rather than wait for the debounce.
 */
export function useDebouncedSearch({
  query,
  buildParams,
}: UseDebouncedSearchOptions): UseDebouncedSearchResult {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [searchText, setSearchText] = useState(query);

  const navigateTo = useCallback(
    (params: SearchParams) => {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value) search.set(key, value);
      }

      const queryString = search.toString();
      startTransition(() => {
        router.push(
          (queryString ? `${pathname}?${queryString}` : pathname) as Route
        );
      });
    },
    [pathname, router]
  );

  useEffect(() => {
    if (searchText === query) return;

    const timeout = setTimeout(() => {
      navigateTo(buildParams(searchText));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchText, query, buildParams, navigateTo]);

  return { searchText, setSearchText, isPending, navigateTo };
}
