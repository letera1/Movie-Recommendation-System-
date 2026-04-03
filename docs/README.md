# CineMatch ML Documentation

Welcome to the CineMatch ML documentation. This project provides a production-ready movie recommendation system using classical ML techniques.

## Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | System architecture, components, data flow, and design decisions |
| [API Reference](api-reference.md) | Complete REST API endpoint documentation with examples |
| [Deployment Guide](deployment.md) | Production deployment instructions for various platforms |
| [Main README](../README.md) | Project overview, quick start, and feature guide |
| [Contributing](../CONTRIBUTING.md) | Guidelines for contributing to the project |
| [Changelog](../CHANGELOG.md) | Release history and planned features |
| [Security](../SECURITY.md) | Security policy and best practices |

## Quick Links

- **API Docs** (when running): http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **GitHub Issues**: Report bugs or request features
- **Code of Conduct**: Community guidelines

## Getting Started

```bash
# 1. Clone and setup
git clone https://github.com/your-org/Movie-Recommendation-System.git
cd Movie-Recommendation-System

# 2. Install dependencies
make setup

# 3. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 4. Start development
make dev
```

## Project Status

- **Version**: 0.1.0
- **Dataset**: MovieLens 100K (100,000 ratings, 943 users, 1,682 movies)
- **Models**: TF-IDF Content-Based, SVD Collaborative, Hybrid
- **API**: FastAPI with 8 REST endpoints
- **Frontend**: Next.js 16 with React Compiler

## Need Help?

- Check the [Main README](../README.md) for quick start instructions
- Review the [Architecture](architecture.md) for system design details
- See the [API Reference](api-reference.md) for endpoint documentation
- Open an [Issue](https://github.com/your-org/Movie-Recommendation-System/issues) for bugs or feature requests
