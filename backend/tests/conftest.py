"""Shared pytest configuration and fixtures."""

import pytest
import os
import sys

# Add backend/src to Python path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))


@pytest.fixture(autouse=True)
def set_test_env():
    """Set environment variables for testing."""
    original_env = os.environ.copy()
    os.environ["ENABLE_DOCS"] = "true"
    os.environ["ALLOWED_ORIGINS"] = "http://localhost:3000"
    os.environ["ALLOWED_HOSTS"] = "localhost,127.0.0.1"
    os.environ["RATE_LIMIT_REQUESTS"] = "1000"
    os.environ["RATE_LIMIT_WINDOW_SECONDS"] = "60"
    yield
    os.environ.clear()
    os.environ.update(original_env)
