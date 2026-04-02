
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
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-6 shadow-xl shadow-cyan-500/5 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          Search Results for <span className="text-cyan-300">&ldquo;{query}&rdquo;</span>
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Refine your search by genre and year to get sharper recommendations.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <GenreFilter selectedGenre={genre} onGenreChange={setGenre} />
          <YearFilter selectedYear={year} onYearChange={setYear} />
        </div>
      </section>

      <div className="mt-8">
        <InfiniteMovieGrid key={`${query}-${genre}-${year}`} title="Matching Movies" queryFn={queryFn} />
      </div>
    </main>
  );
}
