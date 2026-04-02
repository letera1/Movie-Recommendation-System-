import Link from "next/link";
import type { Movie } from "@/types";
import MovieCard, { MovieCardSkeleton } from "./MovieCard";

interface MovieGridProps {
  title: string;
  movies: Movie[];
  isLoading?: boolean;
  showMoreLink?: string;
}

export default function MovieGrid({
  title,
  movies,
  isLoading = false,
  showMoreLink,
}: MovieGridProps) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          {showMoreLink && (
            <Link
              href={showMoreLink}
              className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors"
            >
              Show More &rarr;
            </Link>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        </div>

        {/* Empty State */}
        {!isLoading && movies.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">No movies to display.</p>
          </div>
        )}
      </div>
    </section>
  );
}
