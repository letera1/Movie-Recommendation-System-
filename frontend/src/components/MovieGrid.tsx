import Link from "next/link";
import type { Movie, Recommendation } from "@/types";
import MovieCard, { MovieCardSkeleton } from "./MovieCard";

interface MovieGridProps {
  title: string;
  subtitle?: string;
  movies?: Movie[];
  recommendations?: Recommendation[];
  isLoading?: boolean;
  showScores?: boolean;
  emptyMessage?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
  showMoreLink?: string;
}

const COLUMN_CLASSES: Record<NonNullable<MovieGridProps["columns"]>, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
};

export default function MovieGrid({
  title,
  subtitle,
  movies = [],
  recommendations,
  isLoading = false,
  showScores = false,
  emptyMessage = "No movies to display.",
  columns = 6,
  showMoreLink,
}: MovieGridProps) {
  const entries = recommendations
    ? recommendations.map((rec) => ({ movie: rec.movie, score: rec.score }))
    : movies.map((movie) => ({ movie, score: undefined }));

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-300">{subtitle}</p>}
          </div>
          {showMoreLink && (
            <Link
              href={showMoreLink}
              className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              Show More &rarr;
            </Link>
          )}
        </div>

        <div className={`grid ${COLUMN_CLASSES[columns]} gap-4 md:gap-6`}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : entries.map(({ movie, score }) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  score={showScores ? score : undefined}
                />
              ))}
        </div>

        {!isLoading && entries.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-400">{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
}
