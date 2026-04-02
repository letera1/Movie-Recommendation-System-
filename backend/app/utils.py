"""
Utility functions for data loading and preprocessing.
"""
import os
import re
import zipfile
import requests
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from pathlib import Path


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
    Load and preprocess the movies dataset.
    
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
    
    # Extract year from title (format: "Movie Name (YYYY)")
    movies_df['year'] = movies_df['title'].apply(extract_year_from_title)
    
    # Create genres list from one-hot encoded columns
    movies_df['genres'] = movies_df.apply(
        lambda row: [GENRES[i] for i in range(len(GENRES)) if row[GENRES[i]] == 1],
        axis=1
    )
    
    # Create content string for TF-IDF
    movies_df['content'] = movies_df.apply(
        lambda row: f"{row['title']} {' '.join(row['genres'])}",
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


def load_users(data_path: Optional[Path] = None) -> pd.DataFrame:
    """
    Load the users dataset.
    
    Args:
        data_path: Path to ml-100k directory. If None, downloads the dataset.
    
    Returns:
        DataFrame with user information.
    """
    if data_path is None:
        data_path = download_movielens_100k()
    
    columns = ['user_id', 'age', 'gender', 'occupation', 'zip_code']
    
    users_df = pd.read_csv(
        data_path / "u.user",
        sep='|',
        names=columns
    )
    
    return users_df


def compute_statistics(ratings_df: pd.DataFrame, movies_df: pd.DataFrame) -> Dict:
    """
    Compute dataset statistics.
    
    Returns:
        Dictionary with various statistics.
    """
    n_users = ratings_df['user_id'].nunique()
    n_movies = ratings_df['movie_id'].nunique()
    n_ratings = len(ratings_df)
    sparsity = 1 - (n_ratings / (n_users * n_movies))
    
    # Rating statistics
    rating_stats = ratings_df['rating'].describe().to_dict()
    
    # Most rated movies
    movie_counts = ratings_df.groupby('movie_id').size().reset_index(name='count')
    movie_counts = movie_counts.merge(movies_df[['movie_id', 'title']], on='movie_id')
    top_movies = movie_counts.nlargest(10, 'count')[['title', 'count']].to_dict('records')
    
    return {
        'n_users': n_users,
        'n_movies': n_movies,
        'n_ratings': n_ratings,
        'sparsity': sparsity,
        'rating_stats': rating_stats,
        'top_movies': top_movies
    }


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
    popular = movie_stats.merge(movies_df[['movie_id', 'title', 'genres', 'year']], on='movie_id')
    
    return popular.to_dict('records')


def create_user_item_matrix(ratings_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict, Dict]:
    """
    Create user-item interaction matrix.
    
    Returns:
        Tuple of (matrix, user_id_to_idx, movie_id_to_idx)
    """
    # Create pivot table
    matrix = ratings_df.pivot(
        index='user_id', 
        columns='movie_id', 
        values='rating'
    ).fillna(0)
    
    # Create mappings
    user_id_to_idx = {uid: idx for idx, uid in enumerate(matrix.index)}
    movie_id_to_idx = {mid: idx for idx, mid in enumerate(matrix.columns)}
    
    return matrix, user_id_to_idx, movie_id_to_idx


def search_movies(movies_df: pd.DataFrame, query: str, limit: int = 20) -> List[Dict]:
    """
    Search movies by title.
    
    Args:
        movies_df: Movies DataFrame.
        query: Search query string.
        limit: Maximum number of results.
    
    Returns:
        List of matching movies.
    """
    query_lower = query.lower()
    mask = movies_df['title'].str.lower().str.contains(query_lower, na=False)
    results = movies_df[mask].head(limit)
    
    return [
        {
            'id': int(row['movie_id']),
            'title': row['title'],
            'genres': row['genres'],
            'year': row['year']
        }
        for _, row in results.iterrows()
    ]
