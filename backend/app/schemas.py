"""
Pydantic schemas for the Movie Recommendation System API.
"""
from typing import List, Optional
from pydantic import BaseModel


class Movie(BaseModel):
    """Base movie data model with rich metadata."""
    id: int
    title: str
    genres: List[str]
    year: Optional[int] = None
    overview: Optional[str] = None
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    
    class Config:
        from_attributes = True


class MovieDetail(Movie):
    """Extended movie data for detail views."""
    imdb_url: Optional[str] = None
    rating_count: Optional[int] = None
    avg_rating: Optional[float] = None


class Recommendation(BaseModel):
    """Recommendation result model."""
    movie: Movie
    score: float


class RecommendationResponse(BaseModel):
    """API response for recommendations."""
    recommendations: List[Recommendation]
    method: str


class MovieListResponse(BaseModel):
    """Paginated movie list response."""
    movies: List[Movie]
    total: int
    page: int
    page_size: int


class SearchResponse(BaseModel):
    """Search results response."""
    results: List[Movie]
    query: str
    count: int


class PopularMoviesResponse(BaseModel):
    """Response for popular movies list."""
    movies: List[MovieDetail]
