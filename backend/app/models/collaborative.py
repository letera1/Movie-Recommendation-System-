"""
Collaborative Filtering Model using SVD Matrix Factorization.
"""
import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Set
from pathlib import Path
import joblib

try:
    from surprise import Dataset, Reader, SVD
    from surprise.model_selection import cross_validate
    SURPRISE_AVAILABLE = True
except ImportError:
    SURPRISE_AVAILABLE = False
    print("Warning: scikit-surprise not installed. Collaborative filtering will be disabled.")


class CollaborativeModel:
    """
    Collaborative filtering model using SVD matrix factorization
    from the Surprise library.
    """
    
    def __init__(self):
        self.model: Optional[SVD] = None
        self.movies_df: Optional[pd.DataFrame] = None
        self.ratings_df: Optional[pd.DataFrame] = None
        self.user_rated_movies: Dict[int, Set[int]] = {}
        self.all_movie_ids: Set[int] = set()
        self.all_user_ids: Set[int] = set()
        self._is_fitted = False
    
    def fit(
        self, 
        ratings_df: pd.DataFrame, 
        movies_df: pd.DataFrame,
        n_factors: int = 100,
        n_epochs: int = 20,
        lr_all: float = 0.005,
        reg_all: float = 0.02
    ) -> "CollaborativeModel":
        """
        Train SVD model on user-item ratings.
        
        Args:
            ratings_df: DataFrame with user_id, movie_id, rating columns.
            movies_df: DataFrame with movie information.
            n_factors: Number of latent factors.
            n_epochs: Number of training epochs.
            lr_all: Learning rate for all parameters.
            reg_all: Regularization term for all parameters.
        
        Returns:
            self for method chaining.
        """
        if not SURPRISE_AVAILABLE:
            raise ImportError("scikit-surprise is required for collaborative filtering.")
        
        self.ratings_df = ratings_df.copy()
        self.movies_df = movies_df.copy()
        
        # Store all movie and user IDs
        self.all_movie_ids = set(ratings_df['movie_id'].unique())
        self.all_user_ids = set(ratings_df['user_id'].unique())
        
        # Build user -> rated movies mapping
        self.user_rated_movies = (
            ratings_df.groupby('user_id')['movie_id']
            .apply(set)
            .to_dict()
        )
        
        # Prepare data for Surprise
        reader = Reader(rating_scale=(1, 5))
        data = Dataset.load_from_df(
            ratings_df[['user_id', 'movie_id', 'rating']], 
            reader
        )
        
        # Build full trainset
        trainset = data.build_full_trainset()
        
        # Initialize and train SVD model
        self.model = SVD(
            n_factors=n_factors,
            n_epochs=n_epochs,
            lr_all=lr_all,
            reg_all=reg_all,
            verbose=False
        )
        
        print("Training collaborative filtering model...")
        self.model.fit(trainset)
        
        self._is_fitted = True
        return self
    
    def get_recommendations(
        self, 
        user_id: int, 
        n: int = 10,
        exclude_rated: bool = True
    ) -> List[Dict]:
        """
        Get personalized recommendations for a user.
        
        Args:
            user_id: ID of the user.
            n: Number of recommendations to return.
            exclude_rated: Whether to exclude already rated movies.
        
        Returns:
            List of recommended movies with predicted ratings.
        """
        if not self._is_fitted:
            raise ValueError("Model has not been fitted. Call fit() first.")
        
        # Handle cold start for new users
        if user_id not in self.all_user_ids:
            return self._get_fallback_recommendations(n)
        
        # Get movies the user hasn't rated
        rated_movies = self.user_rated_movies.get(user_id, set())
        
        if exclude_rated:
            candidate_movies = self.all_movie_ids - rated_movies
        else:
            candidate_movies = self.all_movie_ids
        
        # Predict ratings for all candidate movies
        predictions = []
        for movie_id in candidate_movies:
            pred = self.model.predict(user_id, movie_id)
            predictions.append((movie_id, pred.est))
        
        # Sort by predicted rating
        predictions.sort(key=lambda x: x[1], reverse=True)
        
        # Build recommendations
        recommendations = []
        for movie_id, predicted_rating in predictions[:n]:
            movie_row = self.movies_df[
                self.movies_df['movie_id'] == movie_id
            ]
            
            if movie_row.empty:
                continue
            
            movie_row = movie_row.iloc[0]
            
            recommendations.append({
                'movie': {
                    'id': int(movie_id),
                    'title': movie_row['title'],
                    'genres': movie_row['genres'],
                    'year': movie_row['year'],
                    'overview': movie_row.get('overview'),
                    'poster_url': movie_row.get('poster_url'),
                    'backdrop_url': movie_row.get('backdrop_url'),
                },
                'score': float(predicted_rating),
                'method': 'collaborative'
            })
        
        return recommendations
    
    def _get_fallback_recommendations(self, n: int) -> List[Dict]:
        """
        Fallback recommendations for cold start users.
        Returns popular movies based on average rating.
        """
        if self.ratings_df is None or self.movies_df is None:
            return []
        
        # Compute average rating and count per movie
        movie_stats = self.ratings_df.groupby('movie_id').agg({
            'rating': ['mean', 'count']
        }).reset_index()
        movie_stats.columns = ['movie_id', 'avg_rating', 'count']
        
        # Filter movies with at least 50 ratings
        movie_stats = movie_stats[movie_stats['count'] >= 50]
        
        # Sort by average rating
        movie_stats = movie_stats.nlargest(n, 'avg_rating')
        
        # Build recommendations
        recommendations = []
        for _, row in movie_stats.iterrows():
            movie_row = self.movies_df[
                self.movies_df['movie_id'] == row['movie_id']
            ]
            
            if movie_row.empty:
                continue
            
            movie_row = movie_row.iloc[0]
            
            recommendations.append({
                'movie': {
                    'id': int(row['movie_id']),
                    'title': movie_row['title'],
                    'genres': movie_row['genres'],
                    'year': movie_row['year'],
                    'overview': movie_row.get('overview'),
                    'poster_url': movie_row.get('poster_url'),
                    'backdrop_url': movie_row.get('backdrop_url'),
                },
                'score': float(row['avg_rating']),
                'method': 'collaborative_fallback'
            })
        
        return recommendations
    
    def get_similar_users(self, user_id: int, n: int = 10) -> List[int]:
        """
        Find users with similar taste (not implemented in SVD).
        This would require a different approach like user-user CF.
        """
        # SVD doesn't directly support user similarity
        # Return empty list as placeholder
        return []
    
    def predict_rating(self, user_id: int, movie_id: int) -> float:
        """
        Predict the rating a user would give to a movie.
        
        Args:
            user_id: ID of the user.
            movie_id: ID of the movie.
        
        Returns:
            Predicted rating (1-5 scale).
        """
        if not self._is_fitted:
            raise ValueError("Model has not been fitted. Call fit() first.")
        
        prediction = self.model.predict(user_id, movie_id)
        return prediction.est
    
    def evaluate(self, cv: int = 5) -> Dict[str, float]:
        """
        Evaluate model using cross-validation.
        
        Args:
            cv: Number of cross-validation folds.
        
        Returns:
            Dictionary with RMSE and MAE scores.
        """
        if not SURPRISE_AVAILABLE:
            raise ImportError("scikit-surprise is required.")
        
        reader = Reader(rating_scale=(1, 5))
        data = Dataset.load_from_df(
            self.ratings_df[['user_id', 'movie_id', 'rating']], 
            reader
        )
        
        model = SVD(
            n_factors=100,
            n_epochs=20,
            lr_all=0.005,
            reg_all=0.02,
            verbose=False
        )
        
        results = cross_validate(
            model, data, 
            measures=['RMSE', 'MAE'], 
            cv=cv, 
            verbose=False
        )
        
        return {
            'rmse': float(np.mean(results['test_rmse'])),
            'mae': float(np.mean(results['test_mae']))
        }
    
    def save(self, path: Path) -> None:
        """Save model to disk."""
        path.mkdir(parents=True, exist_ok=True)
        
        joblib.dump(self.model, path / "svd_model.joblib")
        joblib.dump(self.movies_df, path / "movies_df.joblib")
        joblib.dump(self.ratings_df, path / "ratings_df.joblib")
        joblib.dump(self.user_rated_movies, path / "user_rated_movies.joblib")
        joblib.dump(self.all_movie_ids, path / "all_movie_ids.joblib")
        joblib.dump(self.all_user_ids, path / "all_user_ids.joblib")
    
    @classmethod
    def load(cls, path: Path) -> "CollaborativeModel":
        """Load model from disk."""
        model = cls()
        
        model.model = joblib.load(path / "svd_model.joblib")
        model.movies_df = joblib.load(path / "movies_df.joblib")
        model.ratings_df = joblib.load(path / "ratings_df.joblib")
        model.user_rated_movies = joblib.load(path / "user_rated_movies.joblib")
        model.all_movie_ids = joblib.load(path / "all_movie_ids.joblib")
        model.all_user_ids = joblib.load(path / "all_user_ids.joblib")
        model._is_fitted = True
        
        return model
