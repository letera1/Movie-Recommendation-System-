
"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchMovies } from '@/lib/api';
import InfiniteMovieGrid from '@/components/InfiniteMovieGrid';
import GenreFilter from '@/components/GenreFilter';
import YearFilter from '@/components/YearFilter';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [genre, setGenre] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const queryFn = (page: number) => {
    return searchMovies(query, page, 20, genre, year).then(data => ({
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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <GenreFilter selectedGenre={genre} onGenreChange={setGenre} />
        <YearFilter selectedYear={year} onYearChange={setYear} />
      </div>

      <InfiniteMovieGrid key={`${query}-${genre}-${year}`} title="" queryFn={queryFn} />
    </main>
  );
}
