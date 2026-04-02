"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { MovieGrid, SearchBar } from "@/components";
import { getMovie, getContentRecommendations, getCollaborativeRecommendations } from "@/lib/api";
import type { MovieDetail, Recommendation } from "@/types";

type RecommendationType = "content" | "collaborative";

export default function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const movieId = parseInt(resolvedParams.id, 10);

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recType, setRecType] = useState<RecommendationType>("content");
  const [isLoadingMovie, setIsLoadingMovie] = useState(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch movie details
  useEffect(() => {
    async function fetchMovie() {
      try {
        setIsLoadingMovie(true);
        const data = await getMovie(movieId);
        setMovie(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load movie");
      } finally {
        setIsLoadingMovie(false);
      }
    }

    fetchMovie();
  }, [movieId]);

  // Fetch recommendations
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setIsLoadingRecs(true);
        let response;
        
        if (recType === "content") {
          response = await getContentRecommendations(movieId, 8);
        } else {
          // For collaborative, use user ID 1 as demo
          response = await getCollaborativeRecommendations(1, 8);
        }
        
        setRecommendations(response.recommendations);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setRecommendations([]);
      } finally {
        setIsLoadingRecs(false);
      }
    }

    fetchRecommendations();
  }, [movieId, recType]);

  // Generate gradient colors based on movie title
  const getGradientColors = (title: string) => {
    const gradients = [
      "from-indigo-500 to-purple-600",
      "from-blue-500 to-teal-500",
      "from-rose-500 to-pink-600",
      "from-amber-500 to-orange-600",
      "from-emerald-500 to-green-600",
    ];
    const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="bg-red-50 text-red-600 rounded-lg p-6 inline-block">
            <h2 className="text-xl font-semibold">Error</h2>
            <p className="mt-2">{error}</p>
            <Link
              href="/"
              className="mt-4 inline-block text-red-700 hover:underline"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Movie Header */}
      <section
        className={`bg-gradient-to-br ${
          movie ? getGradientColors(movie.title) : "from-gray-400 to-gray-600"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href="/"
              className="text-white/80 hover:text-white flex items-center gap-2 w-fit"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </Link>
          </nav>

          {isLoadingMovie ? (
            <div className="animate-pulse">
              <div className="h-10 bg-white/20 rounded w-1/2 mb-4" />
              <div className="h-6 bg-white/20 rounded w-1/4 mb-6" />
              <div className="flex gap-2">
                <div className="h-8 bg-white/20 rounded-full w-20" />
                <div className="h-8 bg-white/20 rounded-full w-24" />
              </div>
            </div>
          ) : movie ? (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Poster */}
              <div className="md:col-span-1">
                <div className="aspect-[2/3] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-24 h-24 text-white/30"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                  </svg>
                </div>
              </div>

              {/* Details */}
              <div className="md:col-span-2 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {movie.title}
                </h1>
                
                {movie.year && (
                  <p className="text-xl text-white/80 mb-4">{movie.year}</p>
                )}

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {movie.avg_rating && (
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className="text-2xl font-bold">
                          {movie.avg_rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 mt-1">Average Rating</p>
                    </div>
                  )}
                  
                  {movie.rating_count && (
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold">
                        {movie.rating_count.toLocaleString()}
                      </div>
                      <p className="text-sm text-white/70 mt-1">Total Ratings</p>
                    </div>
                  )}
                  
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold">#{movie.id}</div>
                    <p className="text-sm text-white/70 mt-1">Movie ID</p>
                  </div>
                </div>

                {/* IMDB Link */}
                {movie.imdb_url && (
                  <a
                    href={movie.imdb_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    <span>View on IMDb</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar placeholder="Search for another movie..." />
          </div>

          {/* Recommendation Type Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-600 font-medium">Recommendations:</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                onClick={() => setRecType("content")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  recType === "content"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Similar Movies
              </button>
              <button
                onClick={() => setRecType("collaborative")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  recType === "collaborative"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                For You (User 1)
              </button>
            </div>
          </div>

          {/* Recommendations Grid */}
          <MovieGrid
            recommendations={recommendations}
            title={
              recType === "content"
                ? "Movies Similar to This"
                : "Recommended For You"
            }
            subtitle={
              recType === "content"
                ? "Based on genres and content similarity"
                : "Based on collaborative filtering (demo user)"
            }
            showScores={true}
            isLoading={isLoadingRecs}
            emptyMessage="No recommendations available"
            columns={4}
          />
        </div>
      </section>
    </div>
  );
}
