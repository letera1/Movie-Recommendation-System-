# API Reference

Complete reference for the CineMatch ML REST API.

**Base URL**: `http://localhost:8000`

## Authentication

The API currently does not require authentication. When user auth is implemented, endpoints will be protected with JWT tokens.

## Rate Limiting

- **Default**: 120 requests per 60 seconds per IP
- **Configurable**: Via `RATE_LIMIT_REQUESTS` and `RATE_LIMIT_WINDOW_SECONDS` environment variables
- **Response**: `429 Too Many Requests` when exceeded

---

## Endpoints

### Health Check

```
GET /health
```

**Response**: `200 OK`
```json
{
  "status": "healthy"
}
```

---

### Root

```
GET /
```

**Response**: `200 OK`
```json
{
  "message": "CineMatch ML API",
  "version": "0.1.0"
}
```

---

### Movies

#### List Movies

```
GET /api/movies?page=1&limit=20
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number (1-indexed) |
| `limit` | int | 20 | Items per page (max 100) |

**Response**: `200 OK`
```json
{
  "movies": [
    {
      "movie_id": 1,
      "title": "Toy Story",
      "year": 1995,
      "genres": ["Animation", "Children's", "Comedy"],
      "poster_url": "https://image.tmdb.org/t/p/w500/..."
    }
  ],
  "total": 1682,
  "page": 1,
  "limit": 20,
  "has_more": true
}
```

#### Search Movies

```
GET /api/movies/search?q=action&genre=Action&year=1995&page=1&limit=20
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (title/overview) |
| `genre` | string | No | Filter by genre |
| `year` | int | No | Filter by release year |
| `page` | int | No | Page number (default: 1) |
| `limit` | int | No | Items per page (default: 20) |

**Response**: `200 OK` (same structure as List Movies)

#### Get Movie Details

```
GET /api/movies/{movie_id}
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `movie_id` | int | Yes | Movie ID |

**Response**: `200 OK`
```json
{
  "movie_id": 1,
  "title": "Toy Story",
  "year": 1995,
  "genres": ["Animation", "Children's", "Comedy"],
  "poster_url": "https://image.tmdb.org/t/p/w500/...",
  "overview": "A cowboy doll is profoundly jealous...",
  "backdrop_url": "https://image.tmdb.org/t/p/original/...",
  "avg_rating": 3.89,
  "total_ratings": 452
}
```

---

### Genres

```
GET /api/genres
```

**Response**: `200 OK`
```json
{
  "genres": [
    "Action",
    "Adventure",
    "Animation",
    "Children's",
    "Comedy",
    ...
  ]
}
```

---

### Recommendations

#### Content-Based Recommendations

```
GET /api/recommendations/content/{movie_id}?top_n=10
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `movie_id` | int | Yes | Movie ID to find similar movies for |

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `top_n` | int | 10 | Number of recommendations |

**Response**: `200 OK`
```json
{
  "recommendations": [
    {
      "movie_id": 2,
      "title": "GoldenEye",
      "score": 0.87,
      "genres": ["Action", "Thriller"],
      "poster_url": "..."
    }
  ]
}
```

#### Collaborative Recommendations

```
GET /api/recommendations/collaborative/{user_id}?top_n=10
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | int | Yes | User ID |

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `top_n` | int | 10 | Number of recommendations |

**Response**: `200 OK` (same structure as Content-Based)

#### Hybrid Recommendations

```
GET /api/recommendations/hybrid?user_id=1&top_n=10&alpha=0.5
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `user_id` | int | Yes | User ID |
| `top_n` | int | 10 | Number of recommendations |
| `alpha` | float | 0.5 | Weight for content-based (0.0-1.0) |

**Response**: `200 OK` (same structure as Content-Based)

---

### Popular Movies

```
GET /api/popular?top_n=10
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `top_n` | int | 10 | Number of popular movies |

**Response**: `200 OK`
```json
{
  "popular": [
    {
      "movie_id": 50,
      "title": "Star Wars",
      "total_ratings": 583,
      "avg_rating": 4.25,
      "genres": ["Action", "Sci-Fi"],
      "poster_url": "..."
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid movie_id: must be positive integer"
}
```

### 404 Not Found
```json
{
  "detail": "Movie with id=99999 not found"
}
```

### 429 Too Many Requests
```json
{
  "detail": "Rate limit exceeded. Try again in 30 seconds."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

Enable/disable via `ENABLE_DOCS=true` environment variable.

---

## Code Examples

### cURL

```bash
# Get content-based recommendations
curl http://localhost:8000/api/recommendations/content/1?top_n=5

# Get hybrid recommendations with custom alpha
curl "http://localhost:8000/api/recommendations/hybrid?user_id=1&alpha=0.7"

# Search movies with filters
curl "http://localhost:8000/api/movies/search?q=star&genre=Sci-Fi"
```

### Python (requests)

```python
import requests

BASE_URL = "http://localhost:8000"

# Content-based recommendations
response = requests.get(f"{BASE_URL}/api/recommendations/content/1")
recs = response.json()

# Hybrid recommendations
params = {"user_id": 1, "alpha": 0.6, "top_n": 10}
response = requests.get(f"{BASE_URL}/api/recommendations/hybrid", params=params)
recs = response.json()

# Search with filters
params = {"q": "action", "genre": "Action", "year": 1995}
response = requests.get(f"{BASE_URL}/api/movies/search", params=params)
movies = response.json()
```

### TypeScript/JavaScript

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Content-based recommendations
const getContentRecommendations = async (movieId: number) => {
  const res = await fetch(`${BASE_URL}/api/recommendations/content/${movieId}`);
  return res.json();
};

// Hybrid recommendations
const getHybridRecommendations = async (userId: number, alpha = 0.5) => {
  const res = await fetch(
    `${BASE_URL}/api/recommendations/hybrid?user_id=${userId}&alpha=${alpha}`
  );
  return res.json();
};
```
