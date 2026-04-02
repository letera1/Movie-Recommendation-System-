"""
Pydantic schemas for the Movie Recommendation System API.
"""
from typing import List, Optional
from pydantic import BaseModel


class Movie(BaseModel):
    """Movie data model."""
    id: int
    title: str
    genres: List[str]
    year: Optional[int] = None
    
    class Config:
        from_attributes = True


class MovieDetail(Movie):
    """Extended movie data with additional metadata."""
    imdb_url: Optional[str] = None
    rating_count: Optional[int] = None
    avg_rating: Optional[float] = None


class Recommendation(BaseModel):
    """Recommendation result model."""
    movie: Movie
    score: float
    method: str  # "content", "collaborative", or "hybrid"


class RecommendationResponse(BaseModel):
    """API response for recommendations."""
    recommendations: List[Recommendation]
    total: int
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
    total: int
