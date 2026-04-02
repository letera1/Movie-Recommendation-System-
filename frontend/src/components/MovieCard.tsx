import Link from "next/link";
import type { Movie } from "@/types";

interface MovieCardProps {
  movie: Movie;
  score?: number;
  method?: string;
  showScore?: boolean;
}

// Generate a consistent color based on movie title
function getGradientColors(title: string): [string, string] {
  const gradients: [string, string][] = [
    ["from-indigo-500", "to-purple-600"],
    ["from-blue-500", "to-teal-500"],
    ["from-rose-500", "to-pink-600"],
    ["from-amber-500", "to-orange-600"],
    ["from-emerald-500", "to-green-600"],
    ["from-violet-500", "to-fuchsia-600"],
    ["from-cyan-500", "to-blue-600"],
    ["from-red-500", "to-rose-600"],
  ];
  
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

export default function MovieCard({
  movie,
  score,
  method,
  showScore = false,
}: MovieCardProps) {
  const [gradientFrom, gradientTo] = getGradientColors(movie.title);

  return (
    <Link href={`/movies/${movie.id}`}>
      <div className="group relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Poster Placeholder */}
        <div
          className={`aspect-[2/3] bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center`}
        >
          <div className="text-center px-4">
            <svg
              className="w-16 h-16 text-white/30 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
            </svg>
            <span className="text-white/80 text-sm font-medium line-clamp-2">
              {movie.title}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {movie.title}
          </h3>
          
          {movie.year && (
            <p className="text-sm text-gray-500 mt-1">{movie.year}</p>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
              >
                {genre}
              </span>
            ))}
            {movie.genres.length > 2 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                +{movie.genres.length - 2}
              </span>
            )}
          </div>

          {/* Score */}
          {showScore && score !== undefined && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">
                  {(score * (method === "collaborative" ? 1 : 5)).toFixed(1)}
                </span>
              </div>
              {method && (
                <span className="text-xs text-gray-400 capitalize">{method}</span>
              )}
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </Link>
  );
}

// Skeleton Loader
export function MovieCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="flex gap-1">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-5 bg-gray-200 rounded-full w-14" />
        </div>
      </div>
    </div>
  );
}
