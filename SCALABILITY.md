# Scalability Architecture Note

## Current Architecture
```
Client (React) → Nginx → FastAPI → PostgreSQL
```

## Scaling Path

### Horizontal Scaling (Load Balancing)
- Run multiple FastAPI instances behind Nginx / AWS ALB
- Stateless JWT auth enables any instance to serve any request
- Use **Gunicorn + Uvicorn workers** for multi-process serving:
  ```
  gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
  ```

### Database Scaling
- **Read replicas** (PostgreSQL streaming replication) for read-heavy loads
- **Connection pooling** via PgBouncer (reduces connection overhead)
- **Partitioning** tasks table by `owner_id` at scale
- Migrate to **Alembic** migrations for schema versioning

### Caching Layer (Redis)
```python
# Cache user sessions / frequently-read data
import redis
r = redis.Redis(host='redis', port=6379, db=0)

# Cache admin stats (invalidate on write)
stats = r.get('admin:stats')
if not stats:
    stats = compute_stats()
    r.setex('admin:stats', 300, json.dumps(stats))
```
- **Token blacklist** on logout stored in Redis (TTL = token expiry)
- **Rate limiting** with Redis sliding window

### Microservices Decomposition
At higher scale, split into:
```
Auth Service       → /api/v1/auth
Task Service       → /api/v1/tasks  
Notification Svc   → /api/v1/notifications
Admin Service      → /api/v1/admin
```
- Use **API Gateway** (Kong, AWS API Gateway) for routing
- **Async communication** via RabbitMQ / Kafka for notifications

### Kubernetes Deployment
```yaml
# 3 replicas, auto-scale on CPU
replicas: 3
autoscaling:
  minReplicas: 2
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70
```

### Logging & Monitoring
- **Structured logging** (JSON) → ELK Stack / Grafana Loki
- **APM** with OpenTelemetry → Jaeger / Datadog
- **Metrics**: Prometheus + Grafana dashboards

### CDN & Static Assets
- Frontend served via **CloudFront / Cloudflare** (< 50ms globally)
- API on **AWS ECS / GKE** with health checks

## Estimated Capacity (current single-node)
| Metric        | Value        |
|---------------|--------------|
| RPS           | ~500         |
| Concurrent    | ~200         |
| DB Conn Pool  | 10 (default) |

## With Redis + 3 replicas + read replica
| Metric        | Value        |
|---------------|--------------|
| RPS           | ~5,000+      |
| Concurrent    | ~2,000+      |
| Latency p99   | < 100ms      |
