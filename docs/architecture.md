# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                     (Next.js 16 Frontend)                     │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Home   │  │  Movie   │  │  Search  │  │ Popular  │    │
│  │   Page   │  │  Detail  │  │  Results │  │  Movies  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (Port 8000)                │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Middleware Stack                    │   │
│  │  CORS → Trusted Host → Security Headers → Rate Limit │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │  Movies    │  │  Genres    │  │  Recommendations   │    │
│  │  Router    │  │  Router    │  │      Router        │    │
│  └────────────┘  └────────────┘  └────────────────────┘    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Business Logic Layer                 │   │
│  │                                                       │   │
│  │  ┌──────────────────┐  ┌─────────────────────────┐  │   │
│  │  │  Content-Based   │  │   Collaborative (SVD)   │  │   │
│  │  │    TF-IDF + Cos  │  │   scikit-surprise SVD   │  │   │
│  │  └──────────────────┘  └─────────────────────────┘  │   │
│  │                                                       │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │         Hybrid Recommendation Engine         │   │   │
│  │  │    (Weighted combination, alpha tunable)     │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Data Layer                         │   │
│  │                                                       │   │
│  │  MovieLens 100K → Parsed → TF-IDF Matrix → Models   │   │
│  │  (u.item, u.data)   (5000 features)   (joblib files) │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│                                                               │
│  ┌──────────────────┐         ┌──────────────────────┐      │
│  │   TMDB API       │         │  MovieLens Dataset   │      │
│  │  (Posters,       │         │  (GroupLens,         │      │
│  │   Overviews)     │         │   100K ratings)      │      │
│  └──────────────────┘         └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (Next.js 16)

| Component | Description | Tech |
|-----------|-------------|------|
| **App Router** | File-based routing with dynamic routes | Next.js 16 App Router |
| **API Client** | Type-safe API calls with retry logic | Fetch API + TypeScript |
| **Infinite Scroll** | Scroll-triggered pagination | `react-intersection-observer` |
| **UI Components** | Movie cards, search bar, filters | React + Tailwind CSS v4 |
| **Styling** | Dark theme with aurora gradient | Tailwind CSS + Google Fonts |
| **Performance** | React Compiler for automatic memoization | `reactCompiler: true` |

### Backend (FastAPI)

| Component | Description | Tech |
|-----------|-------------|------|
| **API Framework** | Async REST API with auto-docs | FastAPI + Uvicorn |
| **Middleware** | Security, CORS, rate limiting | Custom middleware stack |
| **Data Loading** | Auto-download and parse MovieLens | Custom data utilities |
| **ML Pipeline** | Model training and inference | scikit-learn, scikit-surprise |
| **Caching** | Models saved to disk for reuse | joblib serialization |

### ML Models

#### Content-Based Filtering (TF-IDF)
- **Input**: Movie content (title + genres + overview)
- **Vectorization**: TF-IDF (5000 features, 1-2 ngrams, English stop words)
- **Similarity**: Cosine similarity matrix
- **Output**: Top-N similar movies for a given movie ID
- **Performance**: Trained once, saved to `backend/models/content_based/`

#### Collaborative Filtering (SVD)
- **Input**: User-item rating matrix (943 users × 1682 movies)
- **Algorithm**: Singular Value Decomposition (100 latent factors)
- **Training**: 20 epochs, lr=0.005, reg=0.02
- **Output**: Top-N recommended movies for a given user ID
- **Cold Start**: Falls back to popular movies for unknown users

#### Hybrid Recommendations
- **Strategy**: Weighted linear combination
- **Formula**: `score = α × content_score + (1-α) × collaborative_score`
- **Default**: α = 0.5 (equal weighting)
- **Customizable**: Via query parameter `?alpha=0.7`

## Data Flow

```
1. App Startup (lifespan)
   ├─ Download MovieLens 100K (if not cached)
   ├─ Parse u.item → movies DataFrame
   ├─ Augment first 50 movies with TMDB data
   ├─ Parse u.data → ratings DataFrame
   ├─ Train/load content-based model
   ├─ Train/load collaborative model
   └─ Cache models to disk

2. API Request: GET /api/recommendations/content/{movie_id}
   ├─ Lookup movie_id in movie_id_to_idx mapping
   ├─ Compute cosine similarity row
   ├─ Sort and return top-N movies
   └─ Response: RecommendationResponse

3. API Request: GET /api/recommendations/hybrid
   ├─ Get content-based scores for user's rated movies
   ├─ Get collaborative scores for user
   ├─ Combine with alpha weighting
   ├─ Filter already-rated movies
   └─ Response: RecommendationResponse
```

## Deployment Architecture

### Development
```
localhost:8000 (Backend FastAPI) ← → localhost:3000 (Frontend Next.js)
```

### Production (Docker Compose)
```
┌─────────────────┐
│   Reverse Proxy │ (nginx, Traefik, or cloud LB)
│   HTTPS/TLS     │
└────────┬────────┘
         │
    ┌────┴───────┐          ┌──────────────┐
    │  Frontend  │─────────▶│   Backend    │
    │  Next.js   │  API     │   FastAPI    │
    │  (:3000)   │  Calls   │   (:8000)    │
    └────────────┘          └──────┬───────┘
                                   │
                            ┌──────┴───────┐
                            │  Model Files │
                            │  (joblib)    │
                            └──────────────┘
```

## File Structure

```
Movie-Recommendation-System/
├── backend/
│   ├── src/
│   │   ├── api/           # FastAPI routes, schemas, routers
│   │   ├── ml/            # ML models (content-based, collaborative)
│   │   ├── data/          # Data loading and preprocessing
│   │   ├── services/      # External service integrations (TMDB)
│   │   └── core/          # Core configuration (placeholders)
│   ├── tests/             # Pytest test suite
│   ├── models/            # Trained model artifacts (joblib)
│   ├── data/ml-100k/      # MovieLens dataset
│   ├── Dockerfile         # Backend container definition
│   ├── requirements.txt   # Production dependencies
│   └── requirements-dev.txt  # Development dependencies
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # Reusable React components
│   │   ├── lib/           # API client and utilities
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript type definitions
│   ├── Dockerfile         # Frontend container definition
│   └── package.json       # Frontend dependencies
├── notebooks/
│   └── recommendation_system.ipynb  # EDA and model training
├── docs/                  # Documentation
│   └── architecture.md    # This file
├── .github/               # GitHub templates and workflows
├── docker-compose.yml     # Multi-service orchestration
├── Makefile               # Common development commands
└── .pre-commit-config.yaml  # Pre-commit hook configuration
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **TF-IDF over embeddings** | Simpler, faster, interpretable for content-based filtering |
| **SVD over neural networks** | Works well on sparse matrices, less compute required |
| **In-memory rate limiter** | Simple for single-instance; Redis needed for multi-instance |
| **TMDB for first 50 movies** | Performance optimization; full enrichment could be batch job |
| **No database** | MovieLens is static; DB planned for user auth feature |
| **React Compiler** | Automatic performance optimization without manual memoization |

## Future Architecture (Planned)

```
┌─────────────────┐
│   CDN / Edge    │
└────────┬────────┘
         │
    ┌────┴───────┐          ┌──────────────┐
    │  Frontend  │─────────▶│   Backend    │
    │  Next.js   │          │   FastAPI    │
    └────────────┘          └──────┬───────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
       ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐
       │  PostgreSQL  │    │    Redis    │    │   MLflow    │
       │  (Users,     │    │  (Cache,    │    │  (Model     │
       │   Ratings)   │    │   Rate Limit)│   │  Tracking)  │
       └─────────────┘    └─────────────┘    └─────────────┘
```
