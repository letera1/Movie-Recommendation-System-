# Movie Recommendation System

A production-ready movie recommendation system featuring content-based filtering, collaborative filtering, and hybrid recommendations. Built with FastAPI, Next.js 16, TypeScript, and TailwindCSS.

## Features

- **Content-Based Filtering**: TF-IDF vectorization on movie metadata with cosine similarity
- **Collaborative Filtering**: SVD matrix factorization using the Surprise library
- **Hybrid Recommendations**: Weighted combination of both approaches
- **Interactive Frontend**: Modern Next.js 16 app with TypeScript and TailwindCSS
- **RESTful API**: FastAPI with auto-generated OpenAPI documentation
- **Jupyter Notebook**: Complete EDA and model development workflow

## Tech Stack

### Backend
- Python 3.11+
- FastAPI
- scikit-learn (TF-IDF, cosine similarity)
- scikit-surprise (SVD)
- pandas, numpy

### Frontend
- Next.js 16 (App Router)
- TypeScript
- TailwindCSS
- React 19

### Data
- MovieLens 100K Dataset (100,000 ratings, 943 users, 1,682 movies)

## Project Structure

```
Movie-Recommendation-System-/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── schemas.py           # Pydantic models
│   │   ├── utils.py             # Data loading utilities
│   │   ├── models/
│   │   │   ├── content_based.py # TF-IDF model
│   │   │   └── collaborative.py # SVD model
│   │   └── routers/
│   │       └── recommendations.py # API endpoints
│   ├── data/                    # MovieLens data (auto-downloaded)
│   ├── models/                  # Saved model artifacts
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   ├── components/          # React components
│   │   ├── lib/                 # API client
│   │   └── types/               # TypeScript types
│   └── package.json
├── notebooks/
│   └── recommendation_system.ipynb
└── README.md
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Movie-Recommendation-System-
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server (downloads data and trains models on first run)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

### 3. Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | List all movies (paginated) |
| GET | `/api/movies/{id}` | Get movie details |
| GET | `/api/movies/search?q={query}` | Search movies by title |
| GET | `/api/recommendations/content/{movie_id}` | Content-based recommendations |
| GET | `/api/recommendations/collaborative/{user_id}` | Collaborative recommendations |
| GET | `/api/recommendations/hybrid` | Hybrid recommendations |
| GET | `/api/popular` | Popular movies |

### Example Requests

```bash
# Search for movies
curl "http://localhost:8000/api/movies/search?q=star+wars"

# Get content-based recommendations
curl "http://localhost:8000/api/recommendations/content/50?n=5"

# Get collaborative recommendations for user 1
curl "http://localhost:8000/api/recommendations/collaborative/1?n=5"

# Get hybrid recommendations
curl "http://localhost:8000/api/recommendations/hybrid?movie_id=1&user_id=1&n=5"
```

## Jupyter Notebook

The notebook (`notebooks/recommendation_system.ipynb`) includes:

1. **Data Loading**: MovieLens 100K dataset
2. **EDA**: Distribution analysis, sparsity calculation, genre analysis
3. **Content-Based Model**: TF-IDF + cosine similarity implementation
4. **Collaborative Filtering**: SVD matrix factorization
5. **Evaluation**: RMSE, MAE, and qualitative examples

To run the notebook:

```bash
cd notebooks
jupyter notebook recommendation_system.ipynb
```

## Model Details

### Content-Based Filtering
- **Method**: TF-IDF vectorization on movie title + genres
- **Similarity**: Cosine similarity between movie vectors
- **Best for**: Finding movies with similar themes/genres

### Collaborative Filtering
- **Method**: SVD (Singular Value Decomposition) matrix factorization
- **Library**: scikit-surprise
- **Parameters**: 100 latent factors, 20 epochs
- **Best for**: Personalized recommendations based on user history

### Evaluation Results
- **RMSE**: ~0.92 (5-fold cross-validation)
- **MAE**: ~0.72

## Docker Deployment

### Backend Only

```bash
cd backend
docker build -t movie-rec-backend .
docker run -p 8000:8000 movie-rec-backend
```

## Configuration

### Backend Environment Variables
- Data is automatically downloaded to `backend/data/`
- Trained models are cached in `backend/models/`

### Frontend Environment Variables
Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

### Adding New Recommendation Methods

1. Create a new model in `backend/app/models/`
2. Add the model to `backend/app/models/__init__.py`
3. Update the lifespan handler in `backend/app/main.py`
4. Add new endpoints in `backend/app/routers/recommendations.py`

### Extending the Frontend

1. Add new TypeScript types in `frontend/src/types/`
2. Add API functions in `frontend/src/lib/api.ts`
3. Create components in `frontend/src/components/`
4. Add pages in `frontend/src/app/`

## Future Improvements

- [ ] Add user authentication
- [ ] Implement real-time model updates
- [ ] Add deep learning models (neural collaborative filtering)
- [ ] Integrate with TMDB API for posters
- [ ] Add A/B testing framework
- [ ] Deploy to cloud (Azure, AWS, GCP)

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [MovieLens](https://grouplens.org/datasets/movielens/) for the dataset
- [Surprise](https://surpriselib.com/) for collaborative filtering
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Next.js](https://nextjs.org/) for the frontend framework
