"""Tests for the FastAPI application endpoints."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock


@pytest.fixture
def mock_app():
    """Create a mock FastAPI app with test configuration."""
    import os
    os.environ["ENABLE_DOCS"] = "true"
    os.environ["ALLOWED_ORIGINS"] = "http://localhost:3000"
    os.environ["ALLOWED_HOSTS"] = "localhost,127.0.0.1"


@pytest.fixture
def client(mock_app):
    """Create a test client for the API."""
    with patch("src.api.main.lifespan", MagicMock()):
        from src.api.main import app
        with TestClient(app) as test_client:
            yield test_client


class TestHealthEndpoint:
    """Tests for the health check endpoint."""

    def test_health_returns_200(self, client):
        """Health endpoint should return 200 OK."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data


class TestRootEndpoint:
    """Tests for the root endpoint."""

    def test_root_returns_200(self, client):
        """Root endpoint should return 200 OK."""
        response = client.get("/")
        assert response.status_code == 200


class TestSecurityHeaders:
    """Tests for security middleware."""

    def test_security_headers_present(self, client):
        """Security headers should be added to all responses."""
        response = client.get("/health")
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("X-Frame-Options") == "DENY"


class TestHostHeaderProtection:
    """Tests for trusted host middleware."""

    def test_valid_host(self, client):
        """Requests from allowed hosts should succeed."""
        response = client.get("/health", headers={"Host": "localhost"})
        assert response.status_code == 200

    def test_invalid_host(self, client):
        """Requests from disallowed hosts should be rejected."""
        response = client.get("/health", headers={"Host": "evil.com"})
        assert response.status_code == 400


class TestRateLimiter:
    """Tests for rate limiting middleware."""

    def test_rate_limit_not_exceeded(self, client):
        """Initial requests should not be rate limited."""
        for _ in range(10):
            response = client.get("/health")
            assert response.status_code == 200
