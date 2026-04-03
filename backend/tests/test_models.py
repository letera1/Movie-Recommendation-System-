"""Tests for ML models (content-based and collaborative filtering)."""

import pytest
import pandas as pd
import numpy as np
from unittest.mock import patch


class TestContentBasedModel:
    """Tests for the TF-IDF content-based recommendation model."""

    @pytest.fixture
    def sample_movies(self):
        """Create a small sample movies DataFrame."""
        return pd.DataFrame({
            "movie_id": [1, 2, 3],
            "title": ["Movie A (1995)", "Movie B (2000)", "Movie C (2010)"],
            "genres": ["Action|Thriller", "Comedy|Romance", "Action|Sci-Fi"],
            "genre_list": [["Action", "Thriller"], ["Comedy", "Romance"], ["Action", "Sci-Fi"]],
            "overview": ["An action movie", "A romantic comedy", "Sci-fi action"],
            "content": ["Movie A action thriller", "Movie B comedy romance", "Movie C sci-fi action"],
        })

    def test_model_initialization(self):
        """ContentBasedModel should initialize with default parameters."""
        from src.ml.models.content_based import ContentBasedModel
        model = ContentBasedModel()
        assert model.vectorizer is None
        assert model.tfidf_matrix is None

    def test_fit_creates_tfidf_matrix(self, sample_movies):
        """Fitting the model should create a TF-IDF matrix."""
        from src.ml.models.content_based import ContentBasedModel
        model = ContentBasedModel()
        model.fit(sample_movies)
        assert model.tfidf_matrix is not None
        assert model.tfidf_matrix.shape[0] == 3  # 3 movies

    def test_recommendations_return_correct_count(self, sample_movies):
        """get_recommendations should return the requested number of movies."""
        from src.ml.models.content_based import ContentBasedModel
        model = ContentBasedModel()
        model.fit(sample_movies)
        # Create mappings
        model.movie_id_to_idx = {1: 0, 2: 1, 3: 2}
        model.idx_to_movie_id = {0: 1, 1: 2, 2: 3}

        recs = model.get_recommendations(movie_id=1, top_n=2)
        assert len(recs) <= 2


class TestCollaborativeModel:
    """Tests for the SVD collaborative filtering model."""

    def test_model_initialization(self):
        """CollaborativeModel should initialize with default parameters."""
        from src.ml.models.collaborative import CollaborativeModel
        model = CollaborativeModel()
        assert model.model is None
        assert model.trainset is None

    def test_surprise_availability_check(self):
        """Model should check if scikit-surprise is available."""
        from src.ml.models.collaborative import SURPRISE_AVAILABLE
        # Should be a boolean
        assert isinstance(SURPRISE_AVAILABLE, bool)
