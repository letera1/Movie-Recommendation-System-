import Link from "next/link";
import Image from "next/image";
import type { Movie } from "@/types";

interface MovieCardProps {
  movie: Movie;
}

const FALLBACK_IMAGE_URL = "/placeholder.svg"; // A generic placeholder

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`} className="group block">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-rose-500/30">
        <Image
          src={movie.poster_url || FALLBACK_IMAGE_URL}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Gradient overlay for text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-base font-bold leading-tight line-clamp-2">
            {movie.title}
          </h3>
          {movie.year && (
            <p className="text-sm text-gray-300 mt-1">{movie.year}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

// Updated Skeleton Loader
export function MovieCardSkeleton() {
  return (
    <div className="aspect-[2/3] w-full animate-pulse rounded-lg bg-gray-800" />
  );
}
