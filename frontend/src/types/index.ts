// Type definitions for Movie Recommendation System

export interface Movie {
  id: number;
  title: string;
  genres: string[];
  year: number | null;
  overview?: string | null;
  poster_url?: string | null;
  backdrop_url?: string | null;
}

export interface MovieDetail extends Movie {
  imdb_url?: string;
  rating_count?: number;
  avg_rating?: number;
}

export interface Recommendation {
  movie: Movie;
  score: number;
  method: string;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  total: number;
  method: string;
}

export interface MovieListResponse {
  movies: Movie[];
  total: number;
  page: number;
  page_size: number;
}

export interface SearchResponse {
  results: Movie[];
  query: string;
  total_results: number;
  page: number;
  total_pages: number;
}

export interface APIError {
  detail: string;
}
