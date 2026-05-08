# BlazeNeuro DevOps Guide

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Docker Deployment

### Build Image
```bash
docker build -t blazeneuro:latest .
```

### Run Container
```bash
docker-compose up -d
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

## Kubernetes Deployment

### Deploy
```bash
kubectl apply -f k8s-deployment.yaml
```

### Scale
```bash
kubectl scale deployment blazeneuro --replicas=5
```

### Monitor
```bash
kubectl get pods -l app=blazeneuro
kubectl logs -f deployment/blazeneuro
```

## Performance Optimizations

- ✅ Standalone output for minimal Docker image
- ✅ Multi-stage Docker build
- ✅ Static asset caching (1 year)
- ✅ Image optimization (AVIF/WebP)
- ✅ Font optimization with swap
- ✅ Package import optimization
- ✅ Security headers
- ✅ Horizontal pod autoscaling
- ✅ Health checks
- ✅ No page reloads on navigation

## CI/CD Pipeline

GitHub Actions automatically:
- Runs linting
- Builds the application
- Creates Docker images
- Caches build artifacts

## Environment Variables

Required:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Monitoring

Health endpoint: `/api/health`

Returns:
```json
{
  "status": "ok",
  "timestamp": "2026-05-08T20:58:00.000Z",
  "uptime": 12345
}
```
