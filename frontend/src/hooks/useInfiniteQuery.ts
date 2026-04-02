
import { useState, useEffect, useCallback, useRef } from 'react';

interface InfiniteQueryOptions<T> {
  queryFn: (page: number) => Promise<{ items: T[]; hasMore: boolean; total: number; }>;
  initialPage?: number;
}

export function useInfiniteQuery<T>({
  queryFn,
  initialPage = 1,
}: InfiniteQueryOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const hasRequestedInitialPage = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn(page);
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setTotal(result.total);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, queryFn]);

  useEffect(() => {
    if (!hasRequestedInitialPage.current) {
      hasRequestedInitialPage.current = true;
      loadMore();
    }
  }, [loadMore]);

  return { items, isLoading, error, hasMore, total, loadMore };
}
