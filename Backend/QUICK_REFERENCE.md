# 🚀 Quick Reference Guide - ETS PREP Backend

## 📋 Common Commands

### Development
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
```

### Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

### Redis
```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis:alpine

# Connect to Redis CLI
redis-cli

# Check Redis
redis-cli ping

# View all keys
redis-cli KEYS "*"

# Clear all data
redis-cli FLUSHALL
```

## 🔑 Environment Variables Quick Reference

```env
# Essential
SUPABASE_URL=                    # Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=       # Service role key (KEEP SECRET!)
JWT_SECRET=                      # Min 32 characters
REDIS_HOST=localhost             # Redis host
PORT=3001                        # Server port

# Optional
NODE_ENV=development
CODE_EXECUTION_TIMEOUT=10000
MAX_MEMORY_MB=256
```

## 📡 API Quick Reference

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication Header
```
Authorization: Bearer <your_jwt_token>
```

### Common Endpoints

**Register**
```bash
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe",
  "role": "STUDENT"
}
```

**Login**
```bash
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Create Battle**
```bash
POST /battles
{
  "title": "Quick Battle",
  "battle_type": "PUBLIC",
  "difficulty": "MEDIUM",
  "max_players": 4,
  "time_limit_minutes": 30
}
```

**Submit Code**
```bash
POST /submissions/submit
{
  "problem_id": "uuid",
  "code": "def solution(): pass",
  "language": "python"
}
```

## 🔌 WebSocket Quick Reference

### Connect
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: { token: 'your_jwt_token' }
});
```

### Common Events

**Join Battle**
```javascript
socket.emit('battle:join', { battleId: 'uuid' });
```

**Send Chat Message**
```javascript
socket.emit('chat:message', { 
  battleId: 'uuid', 
  message: 'Hello!' 
});
```

**Listen for Updates**
```javascript
socket.on('battle:user_joined', (data) => {
  console.log(`${data.username} joined`);
});

socket.on('battle:leaderboard_updated', (data) => {
  console.log('Leaderboard:', data.leaderboard);
});
```

## 🗄️ Database Quick Reference

### Common Queries

**Get User Profile**
```sql
SELECT * FROM profiles WHERE id = 'user_id';
```

**Get Active Battles**
```sql
SELECT * FROM battles 
WHERE status = 'ACTIVE' 
ORDER BY created_at DESC;
```

**Get User Submissions**
```sql
SELECT s.*, p.title 
FROM submissions s
JOIN problems p ON s.problem_id = p.id
WHERE s.user_id = 'user_id'
ORDER BY s.created_at DESC;
```

**Get Leaderboard**
```sql
SELECT * FROM global_leaderboard
LIMIT 100;
```

## 🐛 Debugging

### Check Server Status
```bash
curl http://localhost:3001/health
```

### Check Redis Connection
```bash
redis-cli ping
# Should return: PONG
```

### View Logs
```bash
# Development logs (console)
npm run dev

# Production logs (files)
tail -f logs/combined.log
tail -f logs/error.log
```

### Common Issues

**Port in use**
```bash
# Find process
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Change port
PORT=3002 npm run dev
```

**Redis not connected**
```bash
# Check if running
redis-cli ping

# Start Redis
docker start redis
```

**Docker permission denied**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

## 📊 Redis Key Patterns

```
session:{userId}                    # User session
battle:{battleId}:state             # Battle state
battle:{battleId}:users             # Active users
battle:{battleId}:leaderboard       # Rankings
ratelimit:{ip}:{endpoint}           # Rate limiting
```

## 🔒 Role-Based Access

| Role | Permissions |
|------|-------------|
| STUDENT | Join battles, submit code, view problems |
| TEACHER | Create problems, manage battles, view all submissions |
| ADMIN | Full access to all resources |

## 🎯 Code Execution Languages

| Language | Docker Image | Extension |
|----------|--------------|-----------|
| Python | python:3.11-alpine | .py |
| JavaScript | node:20-alpine | .js |
| Java | openjdk:17-alpine | .java |
| C++ | gcc:latest | .cpp |
| Go | golang:alpine | .go |
| Rust | rust:alpine | .rs |

## 📈 Performance Tips

1. **Use Redis caching** for frequently accessed data
2. **Paginate** large result sets
3. **Index** database columns used in WHERE clauses
4. **Limit** WebSocket broadcasts to relevant users
5. **Compress** API responses
6. **Cache** problem test cases in Redis

## 🧪 Testing Endpoints

### Using cURL

**Register**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","username":"testuser"}'
```

**Get Problems**
```bash
curl http://localhost:3001/api/v1/problems \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import collection from `/docs/postman_collection.json`
2. Set environment variable `BASE_URL` = `http://localhost:3001/api/v1`
3. Set environment variable `TOKEN` = your JWT token

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production Redis
- [ ] Set up HTTPS
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting
- [ ] Set up monitoring (Sentry, New Relic)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Enable logging
- [ ] Configure auto-scaling

## 📞 Support

- **Documentation**: See README.md, ARCHITECTURE.md, SETUP.md
- **Issues**: Create GitHub issue
- **Email**: support@etsprep.com

## 🔗 Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Redis Documentation](https://redis.io/docs)
- [Socket.io Documentation](https://socket.io/docs)
- [Express.js Documentation](https://expressjs.com)
- [Docker Documentation](https://docs.docker.com)

---

**Last Updated**: January 2026  
**Quick Start Time**: ~5 minutes  
**Full Setup Time**: ~10 minutes
