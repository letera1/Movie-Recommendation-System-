import Link from "next/link";
import Image from "next/image";
import type { Movie } from "@/types";

interface MovieCardProps {
  movie: Movie;
  score?: number;
}

const FALLBACK_IMAGE_URL = "/placeholder.svg"; // A generic placeholder

export default function MovieCard({ movie, score }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`} className="group block h-full">
      <article className="relative aspect-2/3 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-cyan-500/20">
        <Image
          src={movie.poster_url || FALLBACK_IMAGE_URL}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-900/30 to-transparent" />

        {typeof score === "number" && (
          <div className="absolute right-3 top-3 rounded-full border border-cyan-300/40 bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-cyan-200 backdrop-blur-sm">
            Match {Math.round(score * 100)}%
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-base font-semibold leading-tight line-clamp-2">
            {movie.title}
          </h3>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-200/90">
            <span>{movie.year || "Unknown year"}</span>
            <span className="max-w-[55%] truncate">{movie.genres?.[0] || "Movie"}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="aspect-2/3 w-full animate-pulse rounded-2xl bg-slate-800/60" />
  );
}
