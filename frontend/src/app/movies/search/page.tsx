
"use client";

import { useSearchParams } from 'next/navigation';
import { searchMovies } from '@/lib/api';
import InfiniteMovieGrid from '@/components/InfiniteMovieGrid';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const queryFn = (page: number) => {
    return searchMovies(query, page).then(data => ({
      items: data.results,
      hasMore: data.page < data.total_pages,
      total: data.total_results,
    }));
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">
        Search Results for <span className="text-rose-400">"{query}"</span>
      </h1>
      <InfiniteMovieGrid key={query} title="" queryFn={queryFn} />
    </main>
  );
}
