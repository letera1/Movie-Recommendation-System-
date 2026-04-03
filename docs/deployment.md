# Deployment Guide

This guide covers deploying CineMatch ML to production environments.

## Prerequisites

- Docker 24+ and Docker Compose v2
- Domain name (for production)
- TLS certificates (for HTTPS)

---

## Option 1: Docker Compose (Recommended)

### Quick Start

```bash
# 1. Clone and configure
git clone https://github.com/your-org/Movie-Recommendation-System.git
cd Movie-Recommendation-System

# 2. Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Edit environment variables
# backend/.env - Add TMDB_API_KEY, configure ALLOWED_ORIGINS
# frontend/.env.local - Set NEXT_PUBLIC_API_URL

# 4. Start services
make docker-up
# or
docker-compose up -d

# 5. Verify
curl http://localhost:8000/health
curl http://localhost:3000
```

### Production Configuration

**backend/.env**:
```env
TMDB_API_KEY=your_tmdb_api_key_here
ALLOWED_ORIGINS=https://yourdomain.com
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
RATE_LIMIT_REQUESTS=120
RATE_LIMIT_WINDOW_SECONDS=60
ENABLE_DOCS=false
```

**frontend/.env.local**:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### With Reverse Proxy (nginx)

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Update `docker-compose.yml`:
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - frontend
      - backend
```

---

## Option 2: Manual Deployment

### Backend (Ubuntu/Debian)

```bash
# 1. Install Python
sudo apt update
sudo apt install python3.12 python3.12-venv

# 2. Clone and setup
cd /opt
git clone https://github.com/your-org/Movie-Recommendation-System.git
cd Movie-Recommendation-System/backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Configure
cp .env.example .env
# Edit .env with production values

# 4. Create systemd service
sudo nano /etc/systemd/system/cinematch-backend.service
```

**Systemd service file**:
```ini
[Unit]
Description=CineMatch ML Backend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/Movie-Recommendation-System/backend
Environment=PATH=/opt/Movie-Recommendation-System/backend/venv/bin
ExecStart=/opt/Movie-Recommendation-System/backend/venv/bin/uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 5. Enable and start
sudo systemctl enable cinematch-backend
sudo systemctl start cinematch-backend
sudo systemctl status cinematch-backend
```

### Frontend (Vercel - Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy from frontend/ directory
cd frontend
vercel --prod

# 3. Set environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Frontend (Manual with PM2)

```bash
# 1. Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
npm i -g pm2

# 2. Build
cd frontend
npm ci
npm run build

# 3. Start with PM2
pm2 start npm --name "cinematch-frontend" -- start
pm2 save
pm2 startup
```

---

## Option 3: Cloud Platforms

### AWS (ECS/Fargate)

1. **Build and push images to ECR**:
```bash
aws ecr create-repository --repository-name cinematch-backend
aws ecr create-repository --repository-name cinematch-frontend

docker tag cinematch-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/cinematch-backend:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/cinematch-backend:latest
```

2. **Deploy with ECS Task Definitions**
3. **Use Application Load Balancer** for routing

### Google Cloud Run

```bash
# Build and deploy backend
gcloud builds submit --tag gcr.io/PROJECT-ID/cinematch-backend
gcloud run deploy cinematch-backend \
  --image gcr.io/PROJECT-ID/cinematch-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars TMDB_API_KEY=your_key,ALLOWED_ORIGINS=https://yourdomain.com

# Build and deploy frontend
gcloud builds submit --tag gcr.io/PROJECT-ID/cinematch-frontend
gcloud run deploy cinematch-frontend \
  --image gcr.io/PROJECT-ID/cinematch-frontend \
  --platform managed \
  --region us-central1 \
  --set-env-vars NEXT_PUBLIC_API_URL=https://cinematch-backend-xxx.run.app
```

### Azure Container Apps

```bash
# Create Container Apps environment
az containerapp env create -n cinematch-env -g cinematch-rg -l eastus

# Deploy backend
az containerapp create \
  -n cinematch-backend \
  -g cinematch-rg \
  --environment cinematch-env \
  --image your-registry.azurecr.io/cinematch-backend:latest \
  --target-port 8000 \
  --ingress external \
  --env-vars TMDB_API_KEY=your_key ALLOWED_ORIGINS=https://yourdomain.com

# Deploy frontend
az containerapp create \
  -n cinematch-frontend \
  -g cinematch-rg \
  --environment cinematch-env \
  --image your-registry.azurecr.io/cinematch-frontend:latest \
  --target-port 3000 \
  --ingress external \
  --env-vars NEXT_PUBLIC_API_URL=https://cinematch-backend.xxx.azurecontainerapps.io
```

---

## Environment Variables Reference

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TMDB_API_KEY` | No | None | TMDB API key for movie posters |
| `ALLOWED_ORIGINS` | Yes | `*` | CORS allowed origins (comma-separated) |
| `ALLOWED_HOSTS` | Yes | `*` | Allowed host headers |
| `RATE_LIMIT_REQUESTS` | No | 120 | Max requests per window |
| `RATE_LIMIT_WINDOW_SECONDS` | No | 60 | Rate limit window duration |
| `ENABLE_DOCS` | No | true | Enable Swagger/Redoc docs |

### Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8000` | Backend API URL |

---

## Health Checks

### Backend
```bash
curl -f http://localhost:8000/health
```

### Frontend
```bash
curl -f http://localhost:3000
```

---

## Monitoring

### Application Logs

```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend

# Systemd
journalctl -u cinematch-backend -f

# PM2
pm2 logs cinematch-frontend
```

### Metrics to Monitor

- API response times (p50, p95, p99)
- Request error rates
- Rate limit hits
- Model inference latency
- Memory usage (TF-IDF matrix is ~50MB)

---

## Scaling Considerations

| Component | Current | At Scale |
|-----------|---------|----------|
| **Rate Limiting** | In-memory | Redis-based |
| **Model Storage** | Local disk | Shared volume (EFS, Azure Files) |
| **Backend Workers** | 1 (Uvicorn) | 4+ (Gunicorn + Uvicorn workers) |
| **Database** | None | PostgreSQL for user data |
| **Caching** | None | Redis for recommendation caching |

### Backend Gunicorn Config

```python
# gunicorn.conf.py
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
bind = "0.0.0.0:8000"
timeout = 120
keepalive = 5
```

---

## Security Checklist

- [ ] HTTPS enabled (Let's Encrypt or cloud provider)
- [ ] `ALLOWED_ORIGINS` restricted to frontend domain
- [ ] `ALLOWED_HOSTS` restricted to production domain
- [ ] `ENABLE_DOCS=false` in production
- [ ] TMDB API key not exposed to frontend
- [ ] Dependencies updated (`pip-audit`, `npm audit`)
- [ ] Containers run as non-root (already configured)
- [ ] Rate limiting enabled
- [ ] Security headers present (already in middleware)

---

## Rollback Strategy

```bash
# Docker Compose
docker-compose up -d --force-recreate backend  # Redeploy previous image

# Kubernetes
kubectl rollout undo deployment/cinematch-backend

# PM2
pm2 reload cinematch-frontend --update-env
```
