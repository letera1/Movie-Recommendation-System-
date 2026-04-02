"use client";

import { useState, useEffect } from "react";
import { SearchBar, MovieGrid } from "@/components";
import { getPopularMovies } from "@/lib/api";
import type { Movie } from "@/types";
import Image from "next/image";

export default function HomePage() {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPopularMovies() {
      try {
        setIsLoading(true);
        const response = await getPopularMovies(12);
        // Assuming the API returns a list of movies directly
        setPopularMovies(response.movies);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load movies");
        console.error("Error fetching popular movies:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPopularMovies();
  }, []);

  const heroMovie = popularMovies.length > 0 ? popularMovies[0] : null;

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center">
        {heroMovie && heroMovie.backdrop_url && (
          <Image
            src={heroMovie.backdrop_url}
            alt={`Backdrop for ${heroMovie.title}`}
            fill
            className="object-cover object-center opacity-30"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />

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
      <div className="-mt-16 relative z-20">
        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-900/50 text-red-300 rounded-lg p-4 inline-block">
              <p className="font-medium">Error loading movies</p>
              <p className="text-sm mt-1">Could not connect to the backend.</p>
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
