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
 *
 * The component using this must NOT be remounted per query (e.g. via a `key`
 * on the query): the user keeps typing while a search loads, and a remount
 * would reset the box to the older query that just arrived.
 */
export function useDebouncedSearch({
  query,
  buildParams,
}: UseDebouncedSearchOptions): UseDebouncedSearchResult {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [searchText, setSearchText] = useState(query);
  // The `q` this hook last navigated to, and the `query` prop last seen —
  // used to tell our own (stale, by the time it lands) results apart from
  // external URL changes such as the back button.
  const [requestedQuery, setRequestedQuery] = useState(query);
  const [seenQuery, setSeenQuery] = useState(query);

  if (query !== seenQuery) {
    setSeenQuery(query);
    if (query !== requestedQuery) {
      setSearchText(query);
      setRequestedQuery(query);
    }
  }

  const navigate = useCallback(
    ({
      params,
      isReplacing,
    }: {
      params: SearchParams;
      isReplacing: boolean;
    }) => {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value) search.set(key, value);
      }

      const queryString = search.toString();
      const href = (
        queryString ? `${pathname}?${queryString}` : pathname
      ) as Route;

      setRequestedQuery(params.q ?? "");
      startTransition(() => {
        if (isReplacing) {
          router.replace(href, { scroll: false });
          return;
        }
        router.push(href, { scroll: false });
      });
    },
    [pathname, router]
  );

  const navigateTo = useCallback(
    (params: SearchParams) => navigate({ params, isReplacing: false }),
    [navigate]
  );

  useEffect(() => {
    if (searchText === requestedQuery) return;

    // Typing replaces the history entry so Back doesn't step through every
    // intermediate search.
    const timeout = setTimeout(() => {
      navigate({ params: buildParams(searchText), isReplacing: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchText, requestedQuery, buildParams, navigate]);

  return { searchText, setSearchText, isPending, navigateTo };
}
