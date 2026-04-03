# Contributing to CineMatch ML

Thank you for your interest in contributing to CineMatch ML! This project aims to provide a production-ready movie recommendation system using classical ML techniques.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## Getting Started

### Prerequisites

- **Python 3.12+** (backend)
- **Node.js 18+** (frontend)
- **Docker** (optional, for containerized development)

### Local Setup

1. **Fork and clone** the repository
2. **Backend setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # Development dependencies
   ```
3. **Frontend setup**:
   ```bash
   cd frontend
   npm install
   ```
4. **Environment configuration**:
   ```bash
   cp .env.example .env  # backend/.env.example -> backend/.env
   cp .env.example .env.local  # frontend/.env.example -> frontend/.env.local
   ```
   Fill in your API keys and configuration values.

## Development Workflow

### Running the Application

```bash
# Backend (from backend/)
uvicorn src.api.main:app --reload --port 8000

# Frontend (from frontend/)
npm run dev
```

### Using Make (if available)

```bash
make setup      # Install all dependencies
make dev        # Start both backend and frontend
make test       # Run all tests
make lint       # Run linters and formatters
make clean      # Remove build artifacts
```

## Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following the [Coding Standards](#coding-standards)

3. **Write or update tests** for your changes

4. **Ensure all checks pass**:
   ```bash
   make test && make lint
   ```

5. **Commit your changes** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add hybrid recommendation weighting parameter
   fix: resolve CORS issue with frontend
   docs: update API documentation
   ```

6. **Open a Pull Request** with:
   - Clear title and description
   - Link to related issues
   - Screenshots for UI changes
   - Notes on breaking changes (if any)

7. **Address review feedback** promptly. PRs require at least one approval.

## Coding Standards

### Python (Backend)

- Follow [PEP 8](https://peps.python.org/pep-0008/) style guide
- Use type hints for function signatures
- Maximum line length: 88 characters (Black default)
- Docstrings for all public functions, classes, and modules
- Run linting before committing:
  ```bash
  black src/ tests/
  isort src/ tests/
  flake8 src/ tests/
  mypy src/
  ```

### TypeScript (Frontend)

- Strict mode enabled — no `any` types without justification
- Use functional components with hooks
- Co-locate components with their pages when page-specific
- Run linting before committing:
  ```bash
  npm run lint
  ```

### Git Hygiene

- Keep commits focused and atomic
- Write meaningful commit messages
- Rebase on `main` before opening PR to keep history clean

## Testing

### Backend Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=src --cov-report=html

# Run specific test file
pytest tests/test_recommendations.py -v
```

### Frontend Tests

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

### Test Guidelines

- Aim for >80% code coverage on new code
- Unit tests for ML models and utility functions
- Integration tests for API endpoints
- Component tests for critical UI interactions

## Reporting Bugs

Before creating a bug report:

1. **Search existing issues** to avoid duplicates
2. **Include details**:
   - Operating system and version
   - Python/Node.js versions
   - Steps to reproduce
   - Expected vs actual behavior
   - Relevant logs or screenshots

Create an issue using the **Bug Report** template.

## Feature Requests

Before submitting a feature request:

1. **Check existing issues** for similar requests
2. **Describe the use case** clearly
3. **Explain the value** it adds to the project

Create an issue using the **Feature Request** template.

---

**Thank you for contributing!** 🎬
