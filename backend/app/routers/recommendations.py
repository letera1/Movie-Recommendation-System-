"""
API routes for movie recommendations.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from ..schemas import (
    Movie, MovieDetail, Recommendation, RecommendationResponse,
    MovieListResponse, SearchResponse
)

router = APIRouter(prefix="/api", tags=["recommendations"])


# These will be set by the main app on startup
content_model = None
collaborative_model = None
movies_df = None
ratings_df = None


def set_models(content, collaborative, movies, ratings):
    """Set model references from main app."""
    global content_model, collaborative_model, movies_df, ratings_df
    content_model = content
    collaborative_model = collaborative
    movies_df = movies
    ratings_df = ratings


@router.get("/movies", response_model=MovieListResponse)
async def list_movies(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Get paginated list of all movies."""
    if movies_df is None:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    
    movies_slice = movies_df.iloc[start_idx:end_idx]
    
    movies_list = [
        Movie(
            id=int(row['movie_id']),
            title=row['title'],
            genres=row['genres'],
            year=row['year']
        )
        for _, row in movies_slice.iterrows()
    ]
    
    return MovieListResponse(
        movies=movies_list,
        total=len(movies_df),
        page=page,
        page_size=page_size
    )


@router.get("/movies/search", response_model=SearchResponse)
async def search_movies_endpoint(
    query: Optional[str] = Query(None, min_length=1, description="Search query"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    year: Optional[int] = Query(None, description="Filter by year"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Search and filter movies with pagination."""
    if movies_df is None:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    search_results = search_movies(
        movies_df=movies_df,
        query=query,
        genre=genre,
        year=year,
        page=page,
        page_size=page_size
    )
    
    return SearchResponse(
        results=[Movie(**m) for m in search_results['results']],
        query=query or "",
        count=search_results['total_results'],
        page=search_results['page'],
        total_pages=search_results['total_pages']
    )


@router.get("/movies/{movie_id}", response_model=MovieDetail)
async def get_movie(movie_id: int):
    """Get detailed information about a specific movie."""
    if movies_df is None or ratings_df is None:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    movie_row = movies_df[movies_df['movie_id'] == movie_id]
    
    if movie_row.empty:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    movie = movie_row.iloc[0]
    
    # Compute rating statistics
    movie_ratings = ratings_df[ratings_df['movie_id'] == movie_id]
    rating_count = len(movie_ratings)
    avg_rating = float(movie_ratings['rating'].mean()) if rating_count > 0 else None
    
    return MovieDetail(
        id=int(movie_id),
        title=movie['title'],
        genres=movie['genres'],
        year=movie['year'],
        imdb_url=movie.get('imdb_url'),
        rating_count=rating_count,
        avg_rating=round(avg_rating, 2) if avg_rating else None
    )


@router.get("/recommendations/content/{movie_id}", response_model=RecommendationResponse)
async def get_content_recommendations(
    movie_id: int,
    n: int = Query(10, ge=1, le=50, description="Number of recommendations")
):
    """Get content-based recommendations for a movie."""
    if content_model is None:
        raise HTTPException(status_code=503, detail="Content model not loaded")
    
    recommendations = content_model.get_recommendations(movie_id, n=n)
    
    return RecommendationResponse(
        recommendations=[
            Recommendation(
                movie=Movie(**rec['movie']),
                score=rec['score'],
                method=rec['method']
            )
            for rec in recommendations
        ],
        total=len(recommendations),
        method="content"
    )


@router.get("/recommendations/collaborative/{user_id}", response_model=RecommendationResponse)
async def get_collaborative_recommendations(
    user_id: int,
    n: int = Query(10, ge=1, le=50, description="Number of recommendations")
):
    """Get collaborative filtering recommendations for a user."""
    if collaborative_model is None:
        raise HTTPException(
            status_code=503, 
            detail="Collaborative filtering is not available. Install scikit-surprise to enable it."
        )
    
    recommendations = collaborative_model.get_recommendations(user_id, n=n)
    
    return RecommendationResponse(
        recommendations=[
            Recommendation(
                movie=Movie(**rec['movie']),
                score=rec['score'],
                method=rec['method']
            )
            for rec in recommendations
        ],
        total=len(recommendations),
        method="collaborative"
    )


@router.get("/recommendations/hybrid", response_model=RecommendationResponse)
async def get_hybrid_recommendations(
    movie_id: Optional[int] = Query(None, description="Movie ID for content-based"),
    user_id: Optional[int] = Query(None, description="User ID for collaborative"),
    n: int = Query(10, ge=1, le=50, description="Number of recommendations"),
    content_weight: float = Query(0.5, ge=0, le=1, description="Weight for content-based (0-1)")
):
    """
    Get hybrid recommendations combining content-based and collaborative filtering.
    
    - If only movie_id: returns content-based recommendations
    - If only user_id: returns collaborative recommendations
    - If both: returns weighted hybrid recommendations
    """
    if movie_id is None and user_id is None:
        raise HTTPException(
            status_code=400, 
            detail="At least one of movie_id or user_id is required"
        )
    
    # Content-based only
    if movie_id is not None and user_id is None:
        if content_model is None:
            raise HTTPException(status_code=503, detail="Content model not loaded")
        
        recommendations = content_model.get_recommendations(movie_id, n=n)
        method = "content"
    
    # Collaborative only
    elif user_id is not None and movie_id is None:
        if collaborative_model is None:
            raise HTTPException(
                status_code=503, 
                detail="Collaborative filtering is not available. Install scikit-surprise to enable it."
            )
        
        recommendations = collaborative_model.get_recommendations(user_id, n=n)
        method = "collaborative"
    
    # Hybrid
    else:
        if content_model is None:
            raise HTTPException(status_code=503, detail="Content model not loaded")
        
        # Get content recommendations
        content_recs = content_model.get_recommendations(movie_id, n=n*2)
        
        # If collaborative model is available, combine; otherwise use content only
        if collaborative_model is not None:
            collab_recs = collaborative_model.get_recommendations(user_id, n=n*2)
            recommendations = _combine_recommendations(
                content_recs, 
                collab_recs, 
                content_weight=content_weight,
                n=n
            )
            method = "hybrid"
        else:
            # Fall back to content-based only
            recommendations = content_recs[:n]
            method = "content"
    
    return RecommendationResponse(
        recommendations=[
            Recommendation(
                movie=Movie(**rec['movie']),
                score=rec['score'],
                method=rec['method']
            )
            for rec in recommendations
        ],
        total=len(recommendations),
        method=method
    )


def _combine_recommendations(
    content_recs: List[dict],
    collab_recs: List[dict],
    content_weight: float = 0.5,
    n: int = 10
) -> List[dict]:
    """
    Combine recommendations from content-based and collaborative filtering.
    
    Uses weighted scoring and deduplication.
    """
    collab_weight = 1 - content_weight
    
    # Normalize content scores (cosine similarity: 0-1)
    # Already normalized
    
    # Normalize collaborative scores (ratings: 1-5) to 0-1
    for rec in collab_recs:
        rec['score'] = (rec['score'] - 1) / 4  # Map 1-5 to 0-1
    
    # Build score dictionary
    movie_scores = {}
    
    for rec in content_recs:
        movie_id = rec['movie']['id']
        movie_scores[movie_id] = {
            'movie': rec['movie'],
            'content_score': rec['score'] * content_weight,
            'collab_score': 0.0
        }
    
    for rec in collab_recs:
        movie_id = rec['movie']['id']
        if movie_id in movie_scores:
            movie_scores[movie_id]['collab_score'] = rec['score'] * collab_weight
        else:
            movie_scores[movie_id] = {
                'movie': rec['movie'],
                'content_score': 0.0,
                'collab_score': rec['score'] * collab_weight
            }
    
    # Compute combined scores
    combined = []
    for movie_id, data in movie_scores.items():
        combined_score = data['content_score'] + data['collab_score']
        combined.append({
            'movie': data['movie'],
            'score': combined_score,
            'method': 'hybrid'
        })
    
    # Sort by combined score
    combined.sort(key=lambda x: x['score'], reverse=True)
    
    return combined[:n]


@router.get("/popular", response_model=RecommendationResponse)
async def get_popular_movies(
    n: int = Query(10, ge=1, le=50, description="Number of movies"),
    min_ratings: int = Query(50, ge=1, description="Minimum rating count")
):
    """Get popular movies based on average rating."""
    if movies_df is None or ratings_df is None:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    # Compute average rating and count per movie
    movie_stats = ratings_df.groupby('movie_id').agg({
        'rating': ['mean', 'count']
    }).reset_index()
    movie_stats.columns = ['movie_id', 'avg_rating', 'count']
    
    # Filter by minimum ratings
    movie_stats = movie_stats[movie_stats['count'] >= min_ratings]
    
    # Sort by average rating
    movie_stats = movie_stats.nlargest(n, 'avg_rating')
    
    recommendations = []
    for _, row in movie_stats.iterrows():
        movie_row = movies_df[movies_df['movie_id'] == row['movie_id']]
        if movie_row.empty:
            continue
        
        movie = movie_row.iloc[0]
        recommendations.append({
            'movie': {
                'id': int(row['movie_id']),
                'title': movie['title'],
                'genres': movie['genres'],
                'year': movie['year']
            },
            'score': float(row['avg_rating']),
            'method': 'popular'
        })
    
    return RecommendationResponse(
        recommendations=[
            Recommendation(
                movie=Movie(**rec['movie']),
                score=rec['score'],
                method=rec['method']
            )
            for rec in recommendations
        ],
        total=len(recommendations),
        method="popular"
    )
