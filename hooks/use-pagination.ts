import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export type PaginationMode = 'infinite' | 'traditional';

export interface PaginationResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface PaginationConfig<T> {
  fetchFn: (page: number, pageSize: number, ...args: any[]) => Promise<PaginationResponse<T>>;
  pageSize: number;
  mode: PaginationMode;
  onError?: (error: Error) => void;
  dependencies?: any[];
  initialPage?: number;
  getItemId?: (item: T) => string | number;
}

export interface PaginationResult<T> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  currentPage: number;
  totalCount: number;
  totalPages: number;
  loadMore: () => void;
  reset: () => void;
  refresh: () => void;
  setPage: (page: number) => void;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  error: Error | null;
}

export function usePagination<T>({
  fetchFn,
  pageSize,
  mode,
  onError,
  dependencies = [],
  initialPage = 1,
  getItemId = (item: any) => item.id,
}: PaginationConfig<T>): PaginationResult<T> {
  // Core state
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isInitialLoadRef = useRef(true);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  // Fetch data function
  const fetchData = useCallback(async (
    page: number,
    isLoadMore: boolean = false,
    ...args: any[]
  ) => {
    try {
      setError(null);
      
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetchFn(page, pageSize, ...args);
      
      if (isLoadMore) {
        // Append new data for infinite scroll, avoiding duplicates
        setData(prev => {
          const existingIds = new Set(prev.map(item => getItemId(item)));
          const newItems = response.results.filter(item => !existingIds.has(getItemId(item)));
          return [...prev, ...newItems];
        });
      } else {
        // Replace data for traditional pagination or initial load
        setData(response.results);
      }

      setTotalCount(response.count);
      setHasNextPage(!!response.next);
      setCurrentPage(page);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [fetchFn, pageSize, onError]);

  // Load more function (for infinite scroll)
  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoadingMore && !isLoading) {
      fetchData(currentPage + 1, true, ...dependencies);
    }
  }, [hasNextPage, isLoadingMore, isLoading, currentPage, fetchData, dependencies]);

  // Reset function
  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(initialPage);
    setTotalCount(0);
    setHasNextPage(false);
    setError(null);
    isInitialLoadRef.current = true;
  }, [initialPage]);

  // Refresh function
  const refresh = useCallback(() => {
    if (mode === 'infinite') {
      // For infinite scroll, reset and fetch first page
      reset();
      fetchData(initialPage, false, ...dependencies);
    } else {
      // For traditional pagination, refetch current page
      fetchData(currentPage, false, ...dependencies);
    }
  }, [mode, reset, fetchData, initialPage, currentPage, dependencies]);

  // Set page function (for traditional pagination)
  const setPage = useCallback((page: number) => {
    if (mode === 'traditional' && page >= 1 && page <= totalPages) {
      fetchData(page, false, ...dependencies);
    }
  }, [mode, totalPages, fetchData, dependencies]);

  // Initial load effect
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      fetchData(initialPage, false, ...dependencies);
    }
  }, [fetchData, initialPage, dependencies]);

  // Dependencies change effect - reset and refetch
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      reset();
      fetchData(initialPage, false, ...dependencies);
    }
  }, dependencies);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (mode !== 'infinite' || !loadMoreRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isLoadingMore &&
          !isLoading
        ) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;
    observer.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [mode, hasNextPage, isLoadingMore, isLoading, loadMore]);

  return {
    data,
    isLoading,
    isLoadingMore,
    hasNextPage,
    currentPage,
    totalCount,
    totalPages,
    loadMore,
    reset,
    refresh,
    setPage,
    loadMoreRef,
    error,
  };
}
