"""
Utility functions for data loading and preprocessing.
"""
import os
import re
import zipfile
import requests
import pandas as pd
from typing import Dict, List, Optional

from pathlib import Path
from .services.tmdb import get_movie_details, get_poster_url


# Constants
DATA_DIR = Path(__file__).parent.parent / "data"
MOVIELENS_URL = "https://files.grouplens.org/datasets/movielens/ml-100k.zip"

# Genre list for MovieLens 100K
GENRES = [
    "unknown", "Action", "Adventure", "Animation", "Children's", "Comedy",
    "Crime", "Documentary", "Drama", "Fantasy", "Film-Noir", "Horror",
    "Musical", "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"
]


def download_movielens_100k() -> Path:
    """
    Download MovieLens 100K dataset if not already present.
    
    Returns:
        Path to the extracted data directory.
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = DATA_DIR / "ml-100k.zip"
    extract_path = DATA_DIR / "ml-100k"
    
    if extract_path.exists():
        return extract_path
    
    print("Downloading MovieLens 100K dataset...")
    response = requests.get(MOVIELENS_URL, stream=True)
    response.raise_for_status()
    
    with open(zip_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    print("Extracting dataset...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(DATA_DIR)
    
    # Clean up zip file
    zip_path.unlink()
    
    return extract_path


def load_movies(data_path: Optional[Path] = None) -> pd.DataFrame:
    """
    Load and preprocess the movies dataset, augmenting with TMDB data.
    
    Args:
        data_path: Path to ml-100k directory. If None, downloads the dataset.
    
    Returns:
        DataFrame with movie information.
    """
    if data_path is None:
        data_path = download_movielens_100k()
    
    # Column names for u.item file
    columns = ['movie_id', 'title', 'release_date', 'video_release_date', 
               'imdb_url'] + GENRES
    
    movies_df = pd.read_csv(
        data_path / "u.item",
        sep='|',
        names=columns,
        encoding='latin-1'
    )
    
    # --- Augment with TMDB Data ---
    print("Augmenting movie data with TMDB details...")
    tmdb_data = []
    for _, row in movies_df.iterrows():
        # Clean title for better search results
        clean_title = re.sub(r'\s*\(\d{4}\)$', '', row['title']).strip()
        details = get_movie_details(clean_title)
        
        if details:
            tmdb_data.append({
                'movie_id': row['movie_id'],
                'overview': details.get('overview', ''),
                'poster_url': get_poster_url(details.get('poster_path')),
                'backdrop_url': get_poster_url(details.get('backdrop_path'), size='w1280')
            })
        else:
            tmdb_data.append({
                'movie_id': row['movie_id'],
                'overview': '',
                'poster_url': None,
                'backdrop_url': None
            })

    tmdb_df = pd.DataFrame(tmdb_data)
    movies_df = pd.merge(movies_df, tmdb_df, on='movie_id')
    # --- End Augmentation ---

    # Extract year from title (format: "Movie Name (YYYY)")
    movies_df['year'] = movies_df['title'].apply(extract_year_from_title)
    
    # Create genres list from one-hot encoded columns
    movies_df['genres'] = movies_df.apply(
        lambda row: [GENRES[i] for i in range(len(GENRES)) if row[GENRES[i]] == 1],
        axis=1
    )
    
    # Create content string for TF-IDF
    # Now includes overview for richer content
    movies_df['content'] = movies_df.apply(
        lambda row: f"{row['title']} {' '.join(row['genres'])} {row['overview']}",
        axis=1
    )
    
    return movies_df


def extract_year_from_title(title: str) -> Optional[int]:
    """Extract year from movie title format 'Movie Name (YYYY)'."""
    match = re.search(r'\((\d{4})\)', str(title))
    if match:
        return int(match.group(1))
    return None


def load_ratings(data_path: Optional[Path] = None) -> pd.DataFrame:
    """
    Load the ratings dataset.
    
    Args:
        data_path: Path to ml-100k directory. If None, downloads the dataset.
    
    Returns:
        DataFrame with user ratings.
    """
    if data_path is None:
        data_path = download_movielens_100k()
    
    columns = ['user_id', 'movie_id', 'rating', 'timestamp']
    
    ratings_df = pd.read_csv(
        data_path / "u.data",
        sep='\t',
        names=columns
    )
    
    return ratings_df


def get_popular_movies(
    ratings_df: pd.DataFrame, 
    movies_df: pd.DataFrame, 
    n: int = 10,
    min_ratings: int = 50
) -> List[Dict]:
    """
    Get most popular movies by average rating (with minimum rating threshold).
    
    Args:
        ratings_df: Ratings DataFrame.
        movies_df: Movies DataFrame.
        n: Number of movies to return.
        min_ratings: Minimum number of ratings required.
    
    Returns:
        List of popular movies with their scores.
    """
    # Compute average rating and count per movie
    movie_stats = ratings_df.groupby('movie_id').agg({
        'rating': ['mean', 'count']
    }).reset_index()
    movie_stats.columns = ['movie_id', 'avg_rating', 'rating_count']
    
    # Filter by minimum ratings
    movie_stats = movie_stats[movie_stats['rating_count'] >= min_ratings]
    
    # Sort by average rating
    movie_stats = movie_stats.nlargest(n, 'avg_rating')
    
    # Merge with movie info
    popular = movie_stats.merge(movies_df, on='movie_id')
    
    # Select and format columns for the response
    popular_movies = []
    for _, row in popular.iterrows():
        popular_movies.append({
            'id': int(row['movie_id']),
            'title': row['title'],
            'genres': row['genres'],
            'year': row['year'],
            'overview': row['overview'],
            'poster_url': row['poster_url'],
            'avg_rating': row['avg_rating'],
            'rating_count': int(row['rating_count'])
        })
        
    return popular_movies


def search_movies(
    movies_df: pd.DataFrame, 
    query: Optional[str] = None,
    genre: Optional[str] = None,
    year: Optional[int] = None,
    page: int = 1,
    page_size: int = 20
) -> Dict:
    """
    Search and filter movies with pagination.
    
    Args:
        movies_df: Movies DataFrame.
        query: Search query string.
        genre: Genre to filter by.
        year: Year to filter by.
        page: Page number for pagination.
        page_size: Number of results per page.
    
    Returns:
        Dictionary with paginated movie results.
    """
    results_df = movies_df.copy()

    # 1. Filter by query
    if query:
        query_lower = query.lower()
        results_df = results_df[results_df['title'].str.lower().str.contains(query_lower, na=False)]

    # 2. Filter by genre
    if genre:
        results_df = results_df[results_df['genres'].apply(lambda g: genre in g)]

    # 3. Filter by year
    if year:
        results_df = results_df[results_df['year'] == year]

    # 4. Paginate results
    total_results = len(results_df)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_results = results_df.iloc[start_idx:end_idx]

    # 5. Format output
    movies_list = [
        {
            'id': int(row['movie_id']),
            'title': row['title'],
            'genres': row['genres'],
            'year': row['year'],
            'overview': row['overview'],
            'poster_url': row['poster_url'],
        }
        for _, row in paginated_results.iterrows()
    ]
    
    return {
        'results': movies_list,
        'total_results': total_results,
        'page': page,
        'total_pages': (total_results + page_size - 1) // page_size
    }
