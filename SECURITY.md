# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Reporting a Vulnerability

We take the security of CineMatch ML seriously. If you discover a security vulnerability, please follow these steps:

### Do **NOT** Open a Public Issue

Security vulnerabilities should **not** be reported via public GitHub issues.

### How to Report

1. **Email**: Send details to [INSERT SECURITY CONTACT EMAIL]
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Suggested fix (if you have one)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 5 business days
- **Fix timeline**: Depends on severity, typically within 14 days
- **Disclosure**: Coordinated disclosure after fix is deployed

## Security Best Practices for Contributors

### Backend (Python/FastAPI)

- **Never commit secrets**: Use environment variables or `.env` files (already in `.gitignore`)
- **Validate all inputs**: FastAPI's Pydantic models handle this automatically
- **Use parameterized queries**: Avoid SQL injection (not applicable here, but good practice)
- **Rate limiting**: Already implemented in middleware — do not remove without replacement
- **CORS**: Configure `ALLOWED_ORIGINS` strictly in production
- **Dependencies**: Keep `requirements.txt` updated; run `pip-audit` periodically

### Frontend (Next.js/React)

- **Sanitize user input**: React does this by default, but be cautious with `dangerouslySetInnerHTML`
- **Environment variables**: Prefix client-side vars with `NEXT_PUBLIC_`
- **API keys**: Never expose TMDB API key in client-side code
- **Dependencies**: Run `npm audit` regularly and update packages

### General

- **Review PRs carefully**: All code changes require review
- **Use dependency scanning**: GitHub Dependabot is recommended
- **Container security**: Run containers as non-root users (already done in backend Dockerfile)

## Known Security Considerations

- **TMDB API Key**: Should only be used server-side in the backend. Never expose it to the frontend.
- **Rate Limiter**: In-memory rate limiter is per-process. In multi-instance deployments, use Redis-based rate limiting.
- **Model Training Data**: MovieLens 100K dataset contains anonymized user data. Do not attempt to de-anonymize.

## Security Checklist for Deployment

- [ ] `.env` file contains no default or weak credentials
- [ ] `ALLOWED_ORIGINS` is set to specific frontend domains
- [ ] `ALLOWED_HOSTS` restricts to your production domain
- [ ] HTTPS is enabled (reverse proxy or platform-level)
- [ ] Dependencies are up to date (`pip-audit`, `npm audit`)
- [ ] Docker containers run as non-root
- [ ] Logs do not contain sensitive information
- [ ] Security headers are enabled (already in middleware)

---

Thank you for helping keep CineMatch ML secure! 🔒
