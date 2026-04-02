
"use client";

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { MovieGrid } from '@/components';
import { useInfiniteQuery } from '@/hooks/useInfiniteQuery';
import type { Movie } from '@/types';

interface InfiniteMovieGridProps {
  title: string;
  queryFn: (page: number) => Promise<{ items: Movie[]; hasMore: boolean; total: number; }>;
}

export default function InfiniteMovieGrid({ title, queryFn }: InfiniteMovieGridProps) {
  const { items, isLoading, hasMore, loadMore } = useInfiniteQuery<Movie>({ queryFn });
  const { ref, inView } = useInView({ threshold: 0.5 });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, loadMore]);

  return (
    <div>
      <MovieGrid title={title} movies={items} isLoading={items.length === 0 && isLoading} />

      {/* Loading trigger */}
      <div ref={ref} className="h-10" />

      {isLoading && items.length > 0 && (
        <div className="text-center py-4">
          <p className="text-gray-400">Loading more movies...</p>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">You've reached the end of the list.</p>
        </div>
      )}
    </div>
  );
}
