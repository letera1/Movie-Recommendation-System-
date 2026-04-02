
"use client";

import { useState, useEffect } from 'react';
import { getGenres } from '@/lib/api'; // We'll need to create this API function

interface GenreFilterProps {
  selectedGenre: string | null;
  onGenreChange: (genre: string | null) => void;
}

export default function GenreFilter({ selectedGenre, onGenreChange }: GenreFilterProps) {
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const genreList = await getGenres();
        setGenres(['All Genres', ...genreList]);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    }
    fetchGenres();
  }, []);

  return (
    <div className="relative">
      <select
        value={selectedGenre || 'All Genres'}
        onChange={(e) => onGenreChange(e.target.value === 'All Genres' ? null : e.target.value)}
        className="w-full rounded-xl border border-cyan-300/25 bg-slate-900 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/45 transition-all"
      >
        {genres.map((genre) => (
          <option key={genre} value={genre} className="bg-slate-900 text-white">
            {genre}
          </option>
        ))}
      </select>
    </div>
  );
}
