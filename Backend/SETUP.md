# Backend Setup Guide

## Quick Start (5 Minutes)

### 1. Prerequisites Check

```bash
# Check Node.js version (should be >= 18)
node --version

# Check npm version
npm --version

# Check Docker (for code execution)
docker --version

# Check Redis
redis-cli ping
# Should return: PONG
```

### 2. Install Dependencies

```bash
cd Backend
npm install
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
# Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

### 4. Database Setup

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy contents from `../Frontend/supabase/complete_backend_schema.sql`
4. Execute the SQL

**Option B: Using CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 5. Start Redis

```bash
# Using Docker (recommended)
docker run -d --name redis -p 6379:6379 redis:alpine

# Or start local Redis
redis-server
```

### 6. Pull Docker Images (for code execution)

```bash
docker pull python:3.11-alpine
docker pull node:20-alpine
docker pull openjdk:17-alpine
```

### 7. Start Development Server

```bash
npm run dev
```

Server should start on `http://localhost:3001`

## Detailed Setup

### Environment Variables Explained

```env
# Server Configuration
NODE_ENV=development              # development | production
PORT=3001                         # Server port
API_VERSION=v1                    # API version prefix

# Supabase (REQUIRED)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...      # Public anon key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Service role key (KEEP SECRET!)

# JWT (REQUIRED)
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# Redis (REQUIRED for production)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=                   # Leave empty for local dev
REDIS_DB=0

# Code Execution
CODE_EXECUTION_TIMEOUT=10000      # 10 seconds
MAX_MEMORY_MB=256                 # 256 MB
DOCKER_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000       # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# WebSocket
WS_PING_INTERVAL=25000
WS_PING_TIMEOUT=60000
```

### Database Schema Setup

The complete schema includes:
- ✅ User profiles with statistics
- ✅ Problems with test cases
- ✅ Battles (game rooms)
- ✅ Battle participants
- ✅ Submissions with results
- ✅ Tournaments
- ✅ Achievements
- ✅ Chat messages
- ✅ Activity logs
- ✅ Notifications
- ✅ Triggers and functions
- ✅ Row-level security policies

### Redis Setup Options

**Option 1: Docker (Recommended)**
```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:alpine redis-server --appendonly yes
```

**Option 2: Local Installation**

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

**Windows:**
- Download from https://redis.io/download
- Or use WSL2 with Ubuntu

**Verify Redis:**
```bash
redis-cli ping
# Should return: PONG
```

### Docker Setup for Code Execution

**1. Install Docker Desktop**
- Download from https://www.docker.com/products/docker-desktop

**2. Pull Required Images**
```bash
# Python
docker pull python:3.11-alpine

# Node.js
docker pull node:20-alpine

# Java
docker pull openjdk:17-alpine

# C++
docker pull gcc:latest

# Go (optional)
docker pull golang:alpine

# Rust (optional)
docker pull rust:alpine
```

**3. Verify Docker**
```bash
docker ps
# Should show running containers
```

### Testing the Setup

**1. Health Check**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-30T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

**2. API Documentation**
```bash
curl http://localhost:3001/api/v1
```

**3. Test Authentication**
```bash
# Register a user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "role": "STUDENT"
  }'
```

**4. Test WebSocket Connection**

Create a test file `test-socket.js`:
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token-here'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});
```

Run:
```bash
node test-socket.js
```

## Troubleshooting

### Issue: "Cannot connect to Redis"

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# If not running, start it
docker start redis
# or
redis-server
```

### Issue: "Supabase connection failed"

**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
2. Check Supabase project status
3. Ensure service role key (not anon key) is used

### Issue: "Docker permission denied"

**Solution:**
```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo (not recommended for production)
sudo npm run dev
```

### Issue: "Port 3001 already in use"

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process or change PORT in .env
PORT=3002 npm run dev
```

### Issue: "Module not found"

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Using Docker

```bash
# Build image
docker build -t ets-prep-backend .

# Run container
docker run -d \
  --name backend \
  -p 3001:3001 \
  --env-file .env \
  ets-prep-backend
```

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment-Specific Configs

**Development:**
- Enable detailed logging
- Hot reload enabled
- CORS allows localhost

**Production:**
- Minimize logging
- Enable compression
- Strict CORS policy
- Enable HTTPS
- Use production Redis cluster
- Enable monitoring

## Next Steps

1. ✅ Backend server running
2. ✅ Database schema applied
3. ✅ Redis connected
4. ✅ Docker images ready

Now you can:
- Test API endpoints
- Connect frontend application
- Create battles and problems
- Submit code for execution

## Support

- 📧 Email: support@etsprep.com
- 💬 Discord: [Join Server]
- 📚 Docs: [Documentation]
- 🐛 Issues: [GitHub Issues]

---

**Setup Time**: ~5-10 minutes  
**Last Updated**: January 2026
