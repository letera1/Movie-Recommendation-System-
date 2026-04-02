/**
 * API Client for Movie Recommendation System
 */
import type {
  MovieDetail,
  RecommendationResponse,
  MovieListResponse,
  SearchResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getCandidateApiBases(): string[] {
  const bases = [API_BASE];

  if (API_BASE.includes("localhost")) {
    bases.push(API_BASE.replace("localhost", "127.0.0.1"));
  }

  return Array.from(new Set(bases));
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const apiBases = getCandidateApiBases();
  let lastError: unknown;

  for (const base of apiBases) {
    const url = `${base}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, {
        ...options,
        cache: "no-store",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      lastError = error;

      const isNetworkError = error instanceof TypeError;
      const isTimeoutError = error instanceof DOMException && error.name === "AbortError";
      const isLastCandidate = base === apiBases[apiBases.length - 1];

      if (!isNetworkError || isLastCandidate) {
        if (isTimeoutError) {
          throw new Error("Request timeout. Please try again.");
        }
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Network error occurred");
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("Network error occurred");
}

/**
 * Get paginated list of movies
 */
export async function getMovies(
  page: number = 1,
  pageSize: number = 20
): Promise<MovieListResponse> {
  return fetchAPI<MovieListResponse>(
    `/api/movies?page=${page}&page_size=${pageSize}`
  );
}

/**
 * Search movies by title with pagination
 */
export async function searchMovies(
  query: string,
  page: number = 1,
  pageSize: number = 20,
  genre: string | null = null,
  year: number | null = null
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  if (genre) {
    params.append('genre', genre);
  }
  if (year) {
    params.append('year', year.toString());
  }

  return fetchAPI<SearchResponse>(
    `/api/movies/search?${params.toString()}`
  );
}

/**
 * Get list of all movie genres
 */
export async function getGenres(): Promise<string[]> {
  return fetchAPI<string[]>("/api/genres");
}

/**
 * Get movie details by ID
 */
export async function getMovie(id: number): Promise<MovieDetail> {
  return fetchAPI<MovieDetail>(`/api/movies/${id}`);
}

/**
 * Get content-based recommendations for a movie
 */
export async function getContentRecommendations(
  movieId: number,
  n: number = 10
): Promise<RecommendationResponse> {
  return fetchAPI<RecommendationResponse>(
    `/api/recommendations/content/${movieId}?n=${n}`
  );
}

/**
 * Get collaborative filtering recommendations for a user
 */
export async function getCollaborativeRecommendations(
  userId: number,
  n: number = 10
): Promise<RecommendationResponse> {
  return fetchAPI<RecommendationResponse>(
    `/api/recommendations/collaborative/${userId}?n=${n}`
  );
}

/**
 * Get hybrid recommendations
 */
export async function getHybridRecommendations(params: {
  movieId?: number;
  userId?: number;
  n?: number;
  contentWeight?: number;
}): Promise<RecommendationResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.movieId !== undefined) {
    searchParams.append("movie_id", params.movieId.toString());
  }
  if (params.userId !== undefined) {
    searchParams.append("user_id", params.userId.toString());
  }
  if (params.n !== undefined) {
    searchParams.append("n", params.n.toString());
  }
  if (params.contentWeight !== undefined) {
    searchParams.append("content_weight", params.contentWeight.toString());
  }

  return fetchAPI<RecommendationResponse>(
    `/api/recommendations/hybrid?${searchParams.toString()}`
  );
}

/**
 * Get popular movies
 */
export async function getPopularMovies(
  n: number = 10,
  minRatings: number = 50
): Promise<RecommendationResponse> {
  return fetchAPI<RecommendationResponse>(
    `/api/popular?n=${n}&min_ratings=${minRatings}`
  );
}
