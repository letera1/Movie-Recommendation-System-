"""
Content-Based Filtering Model using TF-IDF and Cosine Similarity.
"""
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Optional, Tuple
import joblib
from pathlib import Path


class ContentBasedModel:
    """
    Content-based recommendation model using TF-IDF vectorization
    on movie metadata (title + genres) with cosine similarity.
    """
    
    def __init__(self):
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix: Optional[np.ndarray] = None
        self.movies_df: Optional[pd.DataFrame] = None
        self.movie_id_to_idx: Dict[int, int] = {}
        self.idx_to_movie_id: Dict[int, int] = {}
        self._is_fitted = False
    
    def fit(self, movies_df: pd.DataFrame) -> "ContentBasedModel":
        """
        Build the TF-IDF matrix from movie metadata.
        
        Args:
            movies_df: DataFrame with movie information.
                       Must contain 'movie_id', 'title', 'genres', 'content' columns.
        
        Returns:
            self for method chaining.
        """
        self.movies_df = movies_df.copy()
        
        # Create mappings between movie_id and matrix index
        self.movie_id_to_idx = {
            mid: idx for idx, mid in enumerate(movies_df['movie_id'])
        }
        self.idx_to_movie_id = {
            idx: mid for mid, idx in self.movie_id_to_idx.items()
        }
        
        # Initialize TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=5000,
            ngram_range=(1, 2)
        )
        
        # Build TF-IDF matrix from content
        self.tfidf_matrix = self.vectorizer.fit_transform(movies_df['content'])
        
        self._is_fitted = True
        return self
    
    def get_recommendations(
        self, 
        movie_id: int, 
        n: int = 10,
        exclude_ids: Optional[List[int]] = None
    ) -> List[Dict]:
        """
        Get movie recommendations based on content similarity.
        
        Args:
            movie_id: ID of the reference movie.
            n: Number of recommendations to return.
            exclude_ids: Movie IDs to exclude from results.
        
        Returns:
            List of recommended movies with similarity scores.
        """
        if not self._is_fitted:
            raise ValueError("Model has not been fitted. Call fit() first.")
        
        if movie_id not in self.movie_id_to_idx:
            return self._get_fallback_recommendations(n)
        
        # Get the index of the movie
        idx = self.movie_id_to_idx[movie_id]
        
        # Compute cosine similarity with all other movies
        movie_vector = self.tfidf_matrix[idx:idx+1]
        similarities = cosine_similarity(movie_vector, self.tfidf_matrix).flatten()
        
        # Get indices of similar movies (excluding the input movie)
        similar_indices = similarities.argsort()[::-1]
        
        # Build exclude set
        exclude_set = {movie_id}
        if exclude_ids:
            exclude_set.update(exclude_ids)
        
        # Collect recommendations
        recommendations = []
        for sim_idx in similar_indices:
            sim_movie_id = self.idx_to_movie_id[sim_idx]
            
            if sim_movie_id in exclude_set:
                continue
            
            movie_row = self.movies_df[
                self.movies_df['movie_id'] == sim_movie_id
            ].iloc[0]
            
            recommendations.append({
                'movie': {
                    'id': int(sim_movie_id),
                    'title': movie_row['title'],
                    'genres': movie_row['genres'],
                    'year': movie_row['year'],
                    'overview': movie_row.get('overview'),
                    'poster_url': movie_row.get('poster_url'),
                    'backdrop_url': movie_row.get('backdrop_url'),
                },
                'score': float(similarities[sim_idx]),
                'method': 'content'
            })
            
            if len(recommendations) >= n:
                break
        
        return recommendations
    
    def _get_fallback_recommendations(self, n: int) -> List[Dict]:
        """
        Fallback recommendations when movie_id is not found.
        Returns popular/random movies.
        """
        if self.movies_df is None:
            return []
        
        # Return first n movies as fallback
        sample = self.movies_df.head(n)
        
        return [
            {
                'movie': {
                    'id': int(row['movie_id']),
                    'title': row['title'],
                    'genres': row['genres'],
                    'year': row['year'],
                    'overview': row.get('overview'),
                    'poster_url': row.get('poster_url'),
                    'backdrop_url': row.get('backdrop_url'),
                },
                'score': 0.0,
                'method': 'content_fallback'
            }
            for _, row in sample.iterrows()
        ]
    
    def get_similar_movies(
        self, 
        movie_ids: List[int], 
        n: int = 10
    ) -> List[Dict]:
        """
        Get recommendations based on multiple movies.
        Aggregates similarity scores from multiple reference movies.
        
        Args:
            movie_ids: List of reference movie IDs.
            n: Number of recommendations to return.
        
        Returns:
            List of recommended movies.
        """
        if not self._is_fitted:
            raise ValueError("Model has not been fitted. Call fit() first.")
        
        # Filter valid movie IDs
        valid_ids = [mid for mid in movie_ids if mid in self.movie_id_to_idx]
        
        if not valid_ids:
            return self._get_fallback_recommendations(n)
        
        # Get indices of reference movies
        indices = [self.movie_id_to_idx[mid] for mid in valid_ids]
        
        # Compute average similarity to all reference movies
        total_similarities = np.zeros(self.tfidf_matrix.shape[0])
        
        for idx in indices:
            movie_vector = self.tfidf_matrix[idx:idx+1]
            similarities = cosine_similarity(movie_vector, self.tfidf_matrix).flatten()
            total_similarities += similarities
        
        # Average the similarities
        avg_similarities = total_similarities / len(indices)
        
        # Get top similar movies
        similar_indices = avg_similarities.argsort()[::-1]
        
        # Exclude reference movies
        exclude_set = set(movie_ids)
        
        recommendations = []
        for sim_idx in similar_indices:
            sim_movie_id = self.idx_to_movie_id[sim_idx]
            
            if sim_movie_id in exclude_set:
                continue
            
            movie_row = self.movies_df[
                self.movies_df['movie_id'] == sim_movie_id
            ].iloc[0]
            
            recommendations.append({
                'movie': {
                    'id': int(sim_movie_id),
                    'title': movie_row['title'],
                    'genres': movie_row['genres'],
                    'year': movie_row['year'],
                    'overview': movie_row.get('overview'),
                    'poster_url': movie_row.get('poster_url'),
                    'backdrop_url': movie_row.get('backdrop_url'),
                },
                'score': float(avg_similarities[sim_idx]),
                'method': 'content'
            })
            
            if len(recommendations) >= n:
                break
        
        return recommendations
    
    def save(self, path: Path) -> None:
        """Save model to disk."""
        path.mkdir(parents=True, exist_ok=True)
        
        joblib.dump(self.vectorizer, path / "vectorizer.joblib")
        joblib.dump(self.tfidf_matrix, path / "tfidf_matrix.joblib")
        joblib.dump(self.movies_df, path / "movies_df.joblib")
        joblib.dump(self.movie_id_to_idx, path / "movie_id_to_idx.joblib")
        joblib.dump(self.idx_to_movie_id, path / "idx_to_movie_id.joblib")
    
    @classmethod
    def load(cls, path: Path) -> "ContentBasedModel":
        """Load model from disk."""
        model = cls()
        
        model.vectorizer = joblib.load(path / "vectorizer.joblib")
        model.tfidf_matrix = joblib.load(path / "tfidf_matrix.joblib")
        model.movies_df = joblib.load(path / "movies_df.joblib")
        model.movie_id_to_idx = joblib.load(path / "movie_id_to_idx.joblib")
        model.idx_to_movie_id = joblib.load(path / "idx_to_movie_id.joblib")
        model._is_fitted = True
        
        return model
