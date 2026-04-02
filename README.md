<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0c29,50:302b63,100:24243e&height=200&section=header&text=CineMatch%20ML&fontSize=52&fontColor=ffffff&fontAlignY=38&desc=Hybrid%20Movie%20Recommendation%20System&descAlignY=60&descSize=18&animation=fadeIn" width="100%"/>

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

<br/>

> **Production-ready recommendation engine combining content-based filtering, SVD collaborative filtering, and a weighted hybrid pipeline — served via FastAPI and a modern Next.js dashboard.**

<br/>

[![Models](https://img.shields.io/badge/Models-TF--IDF%20%7C%20SVD%20%7C%20Hybrid-8B5CF6?style=flat-square)](#ml-pipeline)
[![Dataset](https://img.shields.io/badge/Dataset-MovieLens%20100K-orange?style=flat-square)](#dataset)
[![RMSE](https://img.shields.io/badge/RMSE-~0.92%20(5--fold%20CV)-22c55e?style=flat-square)](#evaluation-results)
[![API Docs](https://img.shields.io/badge/API-OpenAPI%203.0-009688?style=flat-square)](#api-reference)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ff69b4?style=flat-square)](CONTRIBUTING.md)

<br/>

[**Quick Start**](#-quick-start) · [**Architecture**](#-architecture) · [**ML Pipeline**](#-ml-pipeline) · [**API Reference**](#-api-reference) · [**Notebook**](#-jupyter-notebook)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [ML Pipeline](#-ml-pipeline)
- [Evaluation Results](#-evaluation-results)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Jupyter Notebook](#-jupyter-notebook)
- [Docker Deployment](#-docker-deployment)
- [Configuration](#-configuration)
- [Extending the System](#-extending-the-system)
- [Roadmap](#-roadmap)

---

## 🧭 Overview

**CineMatch ML** is a production-grade movie recommendation system that implements three complementary recommendation strategies — content-based filtering, collaborative filtering via SVD matrix factorization, and a weighted hybrid pipeline — then serves them through a low-latency REST API and an interactive Next.js frontend.

The system is trained on the **MovieLens 100K** dataset (100,000 ratings · 943 users · 1,682 movies) and auto-downloads data and trains all models on first startup, requiring zero manual setup beyond dependency installation.

```
User Query  →  Strategy Router  →  [ TF-IDF | SVD | Hybrid ]  →  Ranked Recommendations  →  Frontend
```

**Why three strategies?**

| Strategy | Signal Used | Best For |
|---|---|---|
| Content-Based | Movie metadata (title, genre) | Cold-start · Genre exploration |
| Collaborative | User–item rating matrix (SVD) | Personalized · Serendipitous discovery |
| Hybrid | Weighted blend of both | Balanced · Default production path |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           CineMatch ML                               │
│                                                                      │
│  ┌──────────────────────┐   REST /api/*   ┌────────────────────────┐ │
│  │  Next.js 16          │ ◄─────────────► │  FastAPI               │ │
│  │  Dashboard           │                 │  Recommendation API    │ │
│  │  (Port 3000)         │                 │  (Port 8000)           │ │
│  │                      │                 │                        │ │
│  │  ┌────────────────┐  │                 │  ┌──────────────────┐  │ │
│  │  │ Search         │  │                 │  │  Strategy Router │  │ │
│  │  │ Recommendations│  │                 │  └────────┬─────────┘  │ │
│  │  │ Movie Details  │  │                 │           │            │ │
│  │  └────────────────┘  │                 │  ┌────────▼─────────┐  │ │
│  └──────────────────────┘                 │  │ Content │ SVD    │  │ │
│                                           │  │ TF-IDF  │ Collab │  │ │
│                                           │  └────────┬─────────┘  │ │
│                                           └───────────┼────────────┘ │
│  ┌────────────────────────────────────────────────────▼────────────┐ │
│  │  Model Artifacts                                                │ │
│  │  tfidf_matrix.pkl · svd_model.pkl · cosine_sim.pkl · mappings  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend API** | FastAPI, Uvicorn, Pydantic | Async REST server with schema validation |
| **Content-Based ML** | scikit-learn (TF-IDF, cosine similarity) | Movie metadata vectorization and similarity |
| **Collaborative ML** | scikit-surprise (SVD) | Matrix factorization for user–item ratings |
| **Data** | pandas, numpy | Data loading, preprocessing, and feature engineering |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS | Interactive recommendation dashboard |
| **Notebook** | Jupyter, matplotlib, seaborn | EDA and model development workflow |
| **Containerization** | Docker | Reproducible backend deployment |

---

## 🚀 Quick Start

### Prerequisites

| Dependency | Version |
|---|---|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | Latest |

### 1. Clone the Repository

```bash
git clone https://github.com/letera1/Movie-Recommendation-System-.git
cd Movie-Recommendation-System-
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server — auto-downloads MovieLens data and trains models on first run
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

> **First run:** The server automatically downloads the MovieLens 100K dataset and trains all models. This takes ~2 minutes and only happens once. Artifacts are cached in `backend/models/`.

| Service | URL |
|---|---|
| API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| OpenAPI JSON | http://localhost:8000/openapi.json |

### 3. Frontend Setup

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

> **Frontend:** http://localhost:3000

---

## 🔬 ML Pipeline

### 1. Dataset

**MovieLens 100K** — the standard benchmark for recommendation systems research.

| Attribute | Value |
|---|---|
| Ratings | 100,000 |
| Users | 943 |
| Movies | 1,682 |
| Rating Scale | 1–5 stars |
| Sparsity | ~93.7% |
| Source | [GroupLens Research](https://grouplens.org/datasets/movielens/) |

### 2. Content-Based Filtering

Models movie similarity from metadata using TF-IDF vectorization.

```
Movie Title + Genres  →  TF-IDF Matrix  →  Cosine Similarity  →  Top-K Ranked Neighbors
```

| Component | Detail |
|---|---|
| Vectorizer | TF-IDF (sklearn) on `title + genres` |
| Similarity | Cosine similarity between movie vectors |
| Output | Ranked list of similar movies by metadata proximity |
| Cold-start | Handles new users — no rating history required |

### 3. Collaborative Filtering (SVD)

Learns latent user and item factors from the rating matrix via Singular Value Decomposition.

```
User–Item Rating Matrix  →  SVD Factorization  →  Latent Factors  →  Predicted Ratings  →  Top-K
```

| Parameter | Value |
|---|---|
| Algorithm | SVD (scikit-surprise) |
| Latent Factors | 100 |
| Epochs | 20 |
| Evaluation | 5-fold cross-validation |

### 4. Hybrid Pipeline

Blends both strategies via weighted score combination, adapting the weight based on rating data availability for the target user.

```python
hybrid_score = α * content_score + (1 - α) * collaborative_score
# α tunable per request — default: 0.5
```

### 5. Evaluation Results

| Metric | Value | Notes |
|---|---|---|
| RMSE | ~0.92 | 5-fold cross-validation on SVD |
| MAE | ~0.72 | 5-fold cross-validation on SVD |
| Coverage | ~97% | Items receivable as recommendations |

---

## 📡 API Reference

### Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/movies` | Paginated movie catalog |
| `GET` | `/api/movies/{id}` | Single movie details |
| `GET` | `/api/movies/search?q={query}` | Full-text title search |
| `GET` | `/api/recommendations/content/{movie_id}` | Content-based recommendations |
| `GET` | `/api/recommendations/collaborative/{user_id}` | SVD collaborative recommendations |
| `GET` | `/api/recommendations/hybrid` | Weighted hybrid recommendations |
| `GET` | `/api/popular` | Most-rated / highest-rated movies |

### Example Requests

```bash
# Search for a movie
curl "http://localhost:8000/api/movies/search?q=star+wars"

# Content-based: find movies similar to movie ID 50
curl "http://localhost:8000/api/recommendations/content/50?n=5"

# Collaborative: personalized picks for user ID 1
curl "http://localhost:8000/api/recommendations/collaborative/1?n=5"

# Hybrid: blend content + collaborative signals
curl "http://localhost:8000/api/recommendations/hybrid?movie_id=1&user_id=1&n=5"
```

**Hybrid response schema:**

```json
{
  "recommendations": [
    {
      "movie_id": 181,
      "title": "Return of the Jedi (1983)",
      "genres": ["Action", "Adventure", "Sci-Fi"],
      "hybrid_score": 0.87,
      "content_score": 0.91,
      "collaborative_score": 0.83,
      "predicted_rating": 4.2
    }
  ],
  "strategy": "hybrid",
  "alpha": 0.5,
  "user_id": 1,
  "seed_movie_id": 1
}
```

---

## 📁 Project Structure

```
Movie-Recommendation-System-/
│
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app, lifespan handler, model loading
│   │   ├── schemas.py                # Pydantic request/response models
│   │   ├── utils.py                  # Data loading and preprocessing utilities
│   │   ├── models/
│   │   │   ├── content_based.py      # TF-IDF vectorizer + cosine similarity
│   │   │   └── collaborative.py      # SVD matrix factorization (scikit-surprise)
│   │   └── routers/
│   │       └── recommendations.py    # Recommendation API endpoints
│   ├── data/                         # MovieLens data (auto-downloaded on first run)
│   ├── models/                       # Cached model artifacts (*.pkl)
│   ├── requirements.txt              # Pinned Python dependencies
│   └── Dockerfile                    # Backend container definition
│
├── frontend/
│   ├── src/
│   │   ├── app/                      # Next.js App Router pages
│   │   ├── components/               # Reusable React components
│   │   ├── lib/                      # API client (api.ts) and utilities
│   │   └── types/                    # TypeScript type definitions
│   └── package.json
│
├── notebooks/
│   └── recommendation_system.ipynb   # EDA, model development, evaluation
│
└── README.md
```

---

## 📓 Jupyter Notebook

The notebook (`notebooks/recommendation_system.ipynb`) is a complete, self-contained research workflow:

| Section | Content |
|---|---|
| Data Loading | MovieLens 100K ingestion and schema inspection |
| EDA | Rating distribution, sparsity analysis, genre frequency, user activity |
| Content-Based | TF-IDF pipeline, cosine similarity matrix, qualitative examples |
| Collaborative | SVD training, hyperparameter discussion, cross-validation |
| Evaluation | RMSE, MAE, precision@K, qualitative recommendation review |

```bash
cd notebooks
jupyter notebook recommendation_system.ipynb
```

---

## 🐳 Docker Deployment

### Backend Container

```bash
cd backend
docker build -t cinematch-api .
docker run -p 8000:8000 cinematch-api
```

> The container handles data download and model training on first start. Mount a volume to persist artifacts across restarts:

```bash
docker run -p 8000:8000 \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/data:/app/data \
  cinematch-api
```

---

## 🔧 Configuration

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend

Data is automatically downloaded to `backend/data/` and trained model artifacts are cached to `backend/models/` on first run. Subsequent starts load from cache with no retraining.

---

## 🛠 Extending the System

### Adding a New Recommendation Model

1. Create `backend/app/models/your_model.py` implementing the standard recommender interface
2. Register it in `backend/app/models/__init__.py`
3. Add it to the lifespan model-loading block in `backend/app/main.py`
4. Add new endpoints in `backend/app/routers/recommendations.py`

### Extending the Frontend

1. Add TypeScript types in `frontend/src/types/`
2. Add API functions in `frontend/src/lib/api.ts`
3. Build components in `frontend/src/components/`
4. Add pages in `frontend/src/app/`

---

## 🗺 Roadmap

| Feature | Status |
|---|---|
| User authentication and session management | Planned |
| Neural collaborative filtering (NCF) | Planned |
| TMDB API integration for posters and metadata | Planned |
| Real-time model retraining on new ratings | Planned |
| A/B testing framework for strategy comparison | Planned |
| Cloud deployment (AWS / GCP / Azure) | Planned |
| Implicit feedback support (views, clicks) | Planned |

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

| Resource | Contribution |
|---|---|
| [MovieLens — GroupLens Research](https://grouplens.org/datasets/movielens/) | Training dataset |
| [scikit-surprise](https://surpriselib.com/) | SVD collaborative filtering |
| [scikit-learn](https://scikit-learn.org) | TF-IDF vectorization and cosine similarity |
| [FastAPI](https://fastapi.tiangolo.com/) | Async Python API framework |
| [Next.js](https://nextjs.org/) | React production framework |

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:24243e,50:302b63,100:0f0c29&height=100&section=footer" width="100%"/>

**Built for discovery — because the best movie is the one you haven't seen yet.**

*If this project helped you, consider giving it a ⭐*

</div>