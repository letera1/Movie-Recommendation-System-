"""
Movie Recommendation System - FastAPI Application

This is the main entry point for the recommendation API.
"""
from contextlib import asynccontextmanager
from pathlib import Path
import os
import time
from collections import defaultdict, deque
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from src.data.utils import load_movies, load_ratings, download_movielens_100k
from src.ml.models import ContentBasedModel, CollaborativeModel
from src.api.routers import recommendations_router
from src.api.routers.recommendations import set_models

# Paths
BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"


def _bool_from_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _parse_csv_env(name: str, default: list[str]) -> list[str]:
    value = os.getenv(name)
    if not value:
        return default
    parsed = [item.strip() for item in value.split(",") if item.strip()]
    merged = default + parsed
    return list(dict.fromkeys(merged)) or default


ALLOWED_ORIGINS = _parse_csv_env(
    "ALLOWED_ORIGINS",
    [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://172.16.0.2:3000",
    ],
)
ALLOWED_HOSTS = _parse_csv_env("ALLOWED_HOSTS", ["localhost", "127.0.0.1", "*.localhost"])
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "120"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
ENABLE_DOCS = _bool_from_env("ENABLE_DOCS", default=True)

# Simple in-memory rate limiter by client IP.
_request_windows: dict[str, deque[float]] = defaultdict(deque)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Loads data and initializes models on startup.
    """
    print("Starting Movie Recommendation System...")
    
    # Ensure data is downloaded
    data_path = download_movielens_100k()
    print(f"Data loaded from: {data_path}")
    
    # Load datasets
    movies_df = load_movies(data_path)
    ratings_df = load_ratings(data_path)
    
    print(f"Loaded {len(movies_df)} movies and {len(ratings_df)} ratings")
    
    # Initialize content-based model
    content_model_path = MODELS_DIR / "content_based"
    if content_model_path.exists():
        print("Loading saved content-based model...")
        content_model = ContentBasedModel.load(content_model_path)
    else:
        print("Training content-based model...")
        content_model = ContentBasedModel()
        content_model.fit(movies_df)
        content_model.save(content_model_path)
    
    # Initialize collaborative filtering model (optional - requires scikit-surprise)
    collaborative_model = None
    try:
        collab_model_path = MODELS_DIR / "collaborative"
        if collab_model_path.exists():
            print("Loading saved collaborative model...")
            collaborative_model = CollaborativeModel.load(collab_model_path)
        else:
            print("Training collaborative filtering model...")
            collaborative_model = CollaborativeModel()
            collaborative_model.fit(ratings_df, movies_df)
            collaborative_model.save(collab_model_path)
    except ImportError as e:
        print(f"Warning: Collaborative filtering disabled - {e}")
        print("To enable, install scikit-surprise: pip install scikit-surprise")
    except Exception as e:
        print(f"Warning: Could not load collaborative model - {e}")
    
    # Set models in router
    set_models(content_model, collaborative_model, movies_df, ratings_df)
    
    print("Models loaded successfully!")
    print("API is ready to serve requests.")
    
    yield
    
    # Cleanup on shutdown
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Movie Recommendation System",
    description="""
    A production-ready movie recommendation API featuring:
    
    - **Content-Based Filtering**: Recommends movies similar to a given movie based on metadata (title, genres)
    - **Collaborative Filtering**: Recommends movies based on user preferences using matrix factorization (SVD)
    - **Hybrid Recommendations**: Combines both approaches for better results
    
    ## Data Source
    This API uses the MovieLens 100K dataset.
    
    ## API Endpoints
    - `/api/movies` - List and search movies
    - `/api/recommendations/content/{movie_id}` - Content-based recommendations
    - `/api/recommendations/collaborative/{user_id}` - Personalized recommendations
    - `/api/recommendations/hybrid` - Hybrid recommendations
    - `/api/popular` - Popular movies
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if ENABLE_DOCS else None,
    redoc_url="/redoc" if ENABLE_DOCS else None,
    openapi_url="/openapi.json" if ENABLE_DOCS else None,
)

# Restrict accepted Host headers to reduce host header injection risk.
app.add_middleware(TrustedHostMiddleware, allowed_hosts=ALLOWED_HOSTS)

# Add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_middleware(request: Request, call_next):
    """Add secure headers and apply a basic IP-based rate limit."""
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW_SECONDS

    bucket = _request_windows[client_ip]
    while bucket and bucket[0] < window_start:
        bucket.popleft()

    if len(bucket) >= RATE_LIMIT_REQUESTS:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please try again later."},
            headers={"Retry-After": str(RATE_LIMIT_WINDOW_SECONDS)},
        )

    bucket.append(now)
    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Cross-Origin-Resource-Policy"] = "same-site"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"

    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response

# Include routers
app.include_router(recommendations_router)


@app.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        "name": "Movie Recommendation System API",
        "version": "1.0.0",
        "documentation": "/docs",
        "endpoints": {
            "movies": "/api/movies",
            "search": "/api/movies/search?q={query}",
            "movie_detail": "/api/movies/{movie_id}",
            "content_recommendations": "/api/recommendations/content/{movie_id}",
            "collaborative_recommendations": "/api/recommendations/collaborative/{user_id}",
            "hybrid_recommendations": "/api/recommendations/hybrid",
            "popular": "/api/popular"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
