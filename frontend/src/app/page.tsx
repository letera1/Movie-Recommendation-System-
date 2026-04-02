"use client";

import { useState, useEffect } from "react";
import { SearchBar, MovieGrid } from "@/components";
import { getPopularMovies } from "@/lib/api";
import type { Movie, Recommendation } from "@/types";

export default function HomePage() {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPopularMovies() {
      try {
        setIsLoading(true);
        const response = await getPopularMovies(12);
        // Extract movies from recommendations
        const movies = (response.recommendations || []).map((rec: Recommendation) => rec.movie);
        setPopularMovies(movies);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load movies");
        console.error("Error fetching popular movies:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPopularMovies();
  }, []);

  return (
    <main className="min-h-screen text-white">
      <section className="relative mx-auto mt-8 flex min-h-100 max-w-7xl items-center overflow-hidden rounded-3xl border border-cyan-300/20 bg-slate-950/70 px-6 py-16 shadow-2xl shadow-cyan-900/20 sm:px-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-8 top-20 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-14 left-1/3 h-52 w-52 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="absolute inset-0 bg-linear-to-tr from-slate-900/80 via-transparent to-cyan-950/35" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="mb-3 inline-flex rounded-full border border-cyan-200/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
            Smart Discovery Engine
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-6xl">
            Discover Movies With Smarter Recommendations
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-200 md:text-lg">
            Blend content similarity with collaborative intelligence to surface films that actually fit your taste.
          </p>
          <SearchBar
            placeholder="Search by title and jump into recommendations"
            className="mx-auto mt-8 max-w-2xl"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {error ? (
          <div className="text-center py-12">
            <div className="inline-block rounded-xl border border-rose-300/30 bg-rose-900/30 p-5 text-rose-100">
              <p className="font-medium">Error loading movies</p>
              <p className="mt-1 text-sm">Could not connect to the backend.</p>
              <p className="mt-2 text-xs text-rose-300">Make sure the backend is running at http://localhost:8000</p>
            </div>
          </div>
        ) : (
          <MovieGrid
            title="Popular Right Now"
            subtitle="Highly rated picks from MovieLens users"
            movies={popularMovies}
            isLoading={isLoading}
            columns={6}
          />
        )}
      </section>
    </main>
  );
}
