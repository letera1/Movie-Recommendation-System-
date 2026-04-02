import type { Movie, Recommendation } from "@/types";
import MovieCard, { MovieCardSkeleton } from "./MovieCard";

interface MovieGridProps {
  movies?: Movie[];
  recommendations?: Recommendation[];
  title?: string;
  subtitle?: string;
  showScores?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  columns?: 2 | 3 | 4 | 5;
}

export default function MovieGrid({
  movies,
  recommendations,
  title,
  subtitle,
  showScores = false,
  isLoading = false,
  emptyMessage = "No movies found",
  columns = 4,
}: MovieGridProps) {
  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  // Normalize data to work with both movies and recommendations
  const items = recommendations
    ? recommendations.map((rec) => ({
        movie: rec.movie,
        score: rec.score,
        method: rec.method,
      }))
    : movies?.map((movie) => ({
        movie,
        score: undefined,
        method: undefined,
      })) || [];

  return (
    <section className="py-6">
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          )}
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={`grid ${columnClasses[columns]} gap-6`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}

      {/* Movie Grid */}
      {!isLoading && items.length > 0 && (
        <div className={`grid ${columnClasses[columns]} gap-6`}>
          {items.map((item) => (
            <MovieCard
              key={item.movie.id}
              movie={item.movie}
              score={item.score}
              method={item.method}
              showScore={showScores}
            />
          ))}
        </div>
      )}
    </section>
  );
}
