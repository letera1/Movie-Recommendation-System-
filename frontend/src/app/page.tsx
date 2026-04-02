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
    <main className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center">
        {/* Hero background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
            Find Your Next Favorite Film
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Explore thousands of movies and get personalized recommendations.
          </p>
          <SearchBar
            placeholder="Search for a movie..."
            className="max-w-xl mx-auto"
          />
        </div>
      </div>

      {/* Popular Movies Section */}
      <div className="-mt-16 relative z-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-900/50 text-red-300 rounded-lg p-4 inline-block">
              <p className="font-medium">Error loading movies</p>
              <p className="text-sm mt-1">Could not connect to the backend.</p>
              <p className="text-xs mt-2 text-red-400">Make sure the backend is running at http://localhost:8000</p>
            </div>
          </div>
        ) : (
          <MovieGrid
            title="Popular Now"
            movies={popularMovies}
            isLoading={isLoading}
          />
        )}
      </div>
    </main>
  );
}
