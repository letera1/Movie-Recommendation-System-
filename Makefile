# CineMatch ML - Makefile for common development commands
# Usage: make <target>

.PHONY: help setup dev dev-backend dev-frontend test test-backend test-frontend lint lint-backend lint-frontend clean docker-up docker-down docker-build migrate

# Default target
help: ## Show this help message
	@echo "CineMatch ML - Available Commands"
	@echo "================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ==========================================
# Setup
# ==========================================

setup: ## Install all dependencies (backend + frontend)
	@echo "Setting up backend..."
	cd backend && python -m venv venv && \
		venv/bin/pip install --upgrade pip && \
		venv/bin/pip install -r requirements.txt && \
		venv/bin/pip install -r requirements-dev.txt
	@echo "Setting up frontend..."
	cd frontend && npm install
	@echo "Setup complete!"

setup-pre-commit: ## Install pre-commit hooks
	cd backend && venv/bin/pre-commit install

# ==========================================
# Development
# ==========================================

dev: ## Start both backend and frontend in development mode
	@echo "Starting backend on http://localhost:8000"
	@echo "Starting frontend on http://localhost:3000"
	@echo "Press Ctrl+C to stop all services"
	-cd backend && venv/bin/uvicorn src.api.main:app --reload --port 8000 &
	-cd frontend && npm run dev

dev-backend: ## Start backend only
	cd backend && venv/bin/uvicorn src.api.main:app --reload --port 8000

dev-frontend: ## Start frontend only
	cd frontend && npm run dev

# ==========================================
# Testing
# ==========================================

test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests with coverage
	cd backend && venv/bin/pytest tests/ -v --cov=src --cov-report=term-missing

test-frontend: ## Run frontend tests
	cd frontend && npm test

test-coverage: ## Generate and view coverage report
	cd backend && venv/bin/pytest tests/ -v --cov=src --cov-report=html
	@echo "Coverage report generated in backend/htmlcov/index.html"

# ==========================================
# Linting & Formatting
# ==========================================

lint: lint-backend lint-frontend ## Run all linters

lint-backend: ## Run backend linters and formatters
	cd backend && venv/bin/black src/ tests/
	cd backend && venv/bin/isort src/ tests/
	cd backend && venv/bin/flake8 src/ tests/ --max-line-length=88 --ignore=E501,W503
	cd backend && venv/bin/mypy src/ --ignore-missing-imports

lint-frontend: ## Run frontend linter
	cd frontend && npm run lint

format: ## Format code (backend + frontend)
	cd backend && venv/bin/black src/ tests/
	cd backend && venv/bin/isort src/ tests/
	cd frontend && npx prettier --write "src/**/*.{ts,tsx}"

# ==========================================
# Docker
# ==========================================

docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start services with Docker Compose
	docker-compose up -d
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"

docker-down: ## Stop Docker Compose services
	docker-compose down

docker-logs: ## View Docker Compose logs
	docker-compose logs -f

docker-clean: ## Stop and remove Docker Compose services + volumes
	docker-compose down -v

# ==========================================
# Cleanup
# ==========================================

clean: ## Remove build artifacts
	@echo "Cleaning Python artifacts..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".coverage" -delete 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	@echo "Cleaning Node.js artifacts..."
	cd frontend && rm -rf .next/ out/ 2>/dev/null || true
	@echo "Cleaning complete!"
