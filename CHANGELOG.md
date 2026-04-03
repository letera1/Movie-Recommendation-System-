# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of CineMatch ML movie recommendation system
- Content-based filtering using TF-IDF vectorization
- Collaborative filtering using SVD (scikit-surprise)
- Hybrid recommendation engine with tunable weighting
- FastAPI backend with 8 REST endpoints
- Next.js 16 frontend with dark theme and aurora UI
- Infinite scroll pagination for movie catalog
- Full-text search with genre and year filters
- Movie detail pages with similar movie recommendations
- TMDB API integration for posters and overviews
- Docker support for backend deployment
- Security middleware (rate limiting, CORS, trusted hosts)
- React Compiler enabled for frontend performance

### Planned
- [ ] User authentication and personalized profiles
- [ ] Neural Collaborative Filtering (NCF) model
- [ ] Automated model retraining pipeline
- [ ] A/B testing framework for recommendation strategies
- [ ] Implicit feedback tracking (views, watchlist)
- [ ] Cloud deployment guides (AWS, GCP, Azure)
- [ ] Redis-based rate limiting for multi-instance deployments
- [ ] CI/CD pipeline with GitHub Actions

---

## [0.1.0] - 2026-04-03

### Added
- Complete ML pipeline with MovieLens 100K dataset
- Content-based model (TF-IDF + cosine similarity)
  - RMSE: ~0.92, MAE: ~0.72, Coverage: ~97%
- Collaborative model (SVD with 100 latent factors)
- Hybrid recommendations with configurable alpha weighting
- FastAPI backend with auto-download and model training on startup
- Next.js frontend with responsive design
- Comprehensive API documentation (Swagger/Redoc)
- Jupyter notebook for EDA and model training
- MIT License

[Unreleased]: https://github.com/your-org/Movie-Recommendation-System/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-org/Movie-Recommendation-System/releases/tag/v0.1.0
