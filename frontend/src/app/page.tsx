"use client";

import { useState, useEffect } from "react";
import { SearchBar, MovieGrid } from "@/components";
import { getPopularMovies } from "@/lib/api";
import type { Recommendation } from "@/types";

export default function HomePage() {
  const [popularMovies, setPopularMovies] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPopularMovies() {
      try {
        setIsLoading(true);
        const response = await getPopularMovies(12);
        setPopularMovies(response.recommendations);
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Discover Your Next Favorite Movie
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Get personalized movie recommendations powered by machine learning.
              Search for any movie to find similar titles, or explore popular picks.
            </p>
            
            {/* Search Bar */}
            <SearchBar 
              placeholder="Search for a movie... (e.g., Toy Story, Star Wars)"
              className="mx-auto"
            />
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="relative h-16">
          <svg
            className="absolute bottom-0 w-full h-16 text-gray-50"
            preserveAspectRatio="none"
            viewBox="0 0 1440 54"
          >
            <path
              fill="currentColor"
              d="M0 22L60 16.7C120 11 240 1.00001 360 0.700012C480 1.00001 600 11 720 16.7C840 22 960 22 1080 18.3C1200 15 1320 7.00001 1380 3.70001L1440 0.700012V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Content-Based</h3>
              <p className="text-gray-600 text-sm">
                Find movies similar to ones you love based on genres, themes, and metadata using TF-IDF and cosine similarity.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Collaborative Filtering</h3>
              <p className="text-gray-600 text-sm">
                Get personalized recommendations based on user behavior patterns using SVD matrix factorization.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hybrid Approach</h3>
              <p className="text-gray-600 text-sm">
                Combine both methods for the best recommendations, balancing content similarity with user preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Movies Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 text-red-600 rounded-lg p-4 inline-block">
                <p className="font-medium">Error loading movies</p>
                <p className="text-sm mt-1">{error}</p>
                <p className="text-xs mt-2">Make sure the backend is running at http://localhost:8000</p>
              </div>
            </div>
          ) : (
            <MovieGrid
              recommendations={popularMovies}
              title="Popular Movies"
              subtitle="Top-rated movies from our collection"
              showScores={true}
              isLoading={isLoading}
              columns={4}
            />
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Search for any movie to discover similar titles, or browse through our
            collection of over 1,600 movies from the MovieLens dataset.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Explore API
            </a>
            <a
              href="https://grouplens.org/datasets/movielens/100k/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              About the Dataset
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
