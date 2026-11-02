import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

// Case- and accent-insensitive, so "cafe" finds "Café"; toLocaleLowerCase is a
// no-op on Arabic script, and NFKD + stripping combining marks also drops
// Arabic harakat, so a vowelled title still matches a plain query.
export const normalizeForSearch = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[̀-ًͯ-ٰٟ]/g, '')
    .toLocaleLowerCase()
    .trim();

interface Options {
  /** While true the page is not clamped (the list is still empty). */
  isLoading: boolean;
  /** Re-seeds the search from the URL when it changes (e.g. the route slug). */
  resetKey?: unknown;
  perPage?: number;
}

/**
 * Client-side search + pagination for a storefront listing page, mirrored to
 * ?q= and ?page= so a refresh or a shared link keeps both. Shared by the
 * category page (subcategories + direct products) and the subcategory page
 * (products), which both receive their whole list in one response.
 */
export function useListSearchPagination<T>(
  items: T[],
  textOf: (item: T) => string,
  { isLoading, resetKey, perPage = 12 }: Options
) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync page from query param
  useEffect(() => {
    const pageParam = router.query.page;
    const raw = Array.isArray(pageParam) ? pageParam[0] : pageParam;
    const parsed = raw ? parseInt(raw as string, 10) : 1;
    setCurrentPage(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
  }, [router.query.page]);

  // The search is local state, not router.query: _app keys the page on
  // router.asPath, so a router.replace per keystroke would remount the page
  // (refetch, lose input focus). The URL only seeds it on mount;
  // setSearchQuery writes it back behind the router's back.
  const [searchQuery, setSearchInput] = useState('');
  useEffect(() => {
    if (!router.isReady) return;
    const raw = router.query.q;
    setSearchInput((Array.isArray(raw) ? raw[0] : raw) ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, resetKey]);

  const filteredItems = useMemo(() => {
    const needle = normalizeForSearch(searchQuery);
    if (!needle) return items;
    return items.filter(item => normalizeForSearch(textOf(item) || '').includes(needle));
    // textOf is a per-render arrow at every call site; the items carry the data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage));

  // Clamp current page when data changes. Never while loading: _app keys the
  // page on router.asPath, so every ?page= change remounts it and refetches —
  // clamping against the still-empty list reset every page link to page 1.
  useEffect(() => {
    if (isLoading) return;
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, isLoading]);

  const startIndex = (currentPage - 1) * perPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + perPage);

  // A new search always starts on page 1, so drop ?page= along with it. The
  // URL is rewritten with history.replaceState, keeping Next's own history
  // state (url/as) in step so back/forward still route correctly.
  const setSearchQuery = (value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
    const url = new URL(window.location.href);
    url.searchParams.delete('page');
    if (value) url.searchParams.set('q', value);
    else url.searchParams.delete('q');
    const as = url.pathname + url.search + url.hash;
    const state = window.history.state;
    window.history.replaceState(state ? { ...state, as, url: as } : state, '', as);
  };

  const goToPage = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages);
    // ?q= is written outside the router, so router.query may not have it.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { q: _q, ...rest } = router.query;
    router.push(
      {
        pathname: router.pathname,
        query: searchQuery ? { ...rest, q: searchQuery, page: target } : { ...rest, page: target },
      },
      undefined,
      { shallow: true, scroll: true }
    );
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
  };
}
