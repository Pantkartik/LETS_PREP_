# ETS PREP DSA Battles Simulator - Backend

Complete backend architecture for a competitive coding platform with real-time DSA battles, code execution, and comprehensive user management.

## 🚀 Features

### Core Features
- **Real-Time Battle System**: WebSocket-based live coding battles with 2-8 players
- **Code Execution Engine**: Sandboxed Docker-based code execution for multiple languages
- **Problem Management**: CRUD operations for DSA problems with test cases
- **User Management**: Complete authentication with role-based access control
- **Leaderboards**: Real-time and global leaderboards with Redis caching
- **Chat System**: Battle room chat with typing indicators
- **Tournaments**: Multi-round competitive tournaments
- **Achievements**: Badge and milestone system
- **Analytics**: Activity tracking and heatmap data

### Technical Features
- **Authentication**: Supabase Auth with JWT tokens
- **Real-Time**: Socket.io for WebSocket connections
- **Caching**: Redis for session management and leaderboards
- **Code Execution**: Docker containers with resource limits
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Zod schemas for request validation
- **Error Handling**: Comprehensive error handling and logging
- **Security**: CORS, Helmet, input sanitization

## 📋 Prerequisites

- **Node.js** >= 18.x
- **PostgreSQL** (via Supabase)
- **Redis** >= 6.x
- **Docker** (for code execution)
- **npm** or **yarn**

## 🛠️ Installation

### 1. Clone the repository

```bash
cd Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Configure your `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Code Execution
CODE_EXECUTION_TIMEOUT=10000
MAX_MEMORY_MB=256
DOCKER_ENABLED=true

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Database Setup

Run the database migrations:

```bash
# Apply the complete schema
psql -h your_supabase_host -U postgres -d postgres -f ../Frontend/supabase/complete_backend_schema.sql
```

Or use Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `complete_backend_schema.sql`
3. Run the SQL

### 5. Redis Setup

**Using Docker:**

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

**Or install locally:**

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download from https://redis.io/download
```

### 6. Docker Setup (for Code Execution)

Pull required Docker images:

```bash
docker pull python:3.11-alpine
docker pull node:20-alpine
docker pull openjdk:17-alpine
docker pull gcc:latest
```

## 🚀 Running the Server

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Production Mode

```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api/v1
```

### Authentication Endpoints

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe",
  "full_name": "John Doe",
  "role": "STUDENT"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Battle Endpoints

#### Create Battle
```http
POST /api/v1/battles
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Quick DSA Battle",
  "description": "30-minute coding challenge",
  "battle_type": "PUBLIC",
  "difficulty": "MEDIUM",
  "max_players": 4,
  "time_limit_minutes": 30
}
```

#### Join Battle
```http
POST /api/v1/battles/:id/join
Authorization: Bearer <token>
```

#### Get Battle Leaderboard
```http
GET /api/v1/battles/:id/leaderboard
Authorization: Bearer <token>
```

### Problem Endpoints

#### Get Problems
```http
GET /api/v1/problems?difficulty=MEDIUM&category=Arrays&page=1&limit=20
Authorization: Bearer <token>
```

#### Create Problem (Teacher Only)
```http
POST /api/v1/problems
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Two Sum",
  "slug": "two-sum",
  "description": "Find two numbers that add up to target",
  "difficulty": "EASY",
  "category": "Arrays",
  "test_cases": [
    {
      "input": "[2,7,11,15], 9",
      "expected_output": "[0,1]",
      "is_hidden": false
    }
  ],
  "starter_code": {
    "python": "def twoSum(nums, target):\n    pass"
  }
}
```

### Submission Endpoints

#### Submit Code
```http
POST /api/v1/submissions/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "problem_id": "uuid",
  "battle_id": "uuid",
  "code": "def twoSum(nums, target):\n    return [0, 1]",
  "language": "python"
}
```

#### Run Code (Custom Input)
```http
POST /api/v1/submissions/run
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "print('Hello World')",
  "language": "python",
  "input": ""
}
```

### User Endpoints

#### Get Profile
```http
GET /api/v1/users/profile
Authorization: Bearer <token>
```

#### Get User Stats
```http
GET /api/v1/users/stats
Authorization: Bearer <token>
```

#### Get Global Leaderboard
```http
GET /api/v1/users/leaderboard/global
Authorization: Bearer <token>
```

## 🔌 WebSocket Events

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Battle Events

#### Join Battle
```javascript
socket.emit('battle:join', { battleId: 'uuid' });
```

#### Listen for User Joined
```javascript
socket.on('battle:user_joined', (data) => {
  console.log(`${data.username} joined the battle`);
});
```

#### Submit Code
```javascript
socket.emit('battle:submit', { 
  battleId: 'uuid', 
  submissionId: 'uuid' 
});
```

#### Listen for Leaderboard Updates
```javascript
socket.on('battle:leaderboard_updated', (data) => {
  console.log('Leaderboard:', data.leaderboard);
});
```

### Chat Events

#### Send Message
```javascript
socket.emit('chat:message', { 
  battleId: 'uuid', 
  message: 'Hello everyone!' 
});
```

#### Listen for Messages
```javascript
socket.on('chat:new_message', (message) => {
  console.log(`${message.user.username}: ${message.message}`);
});
```

## 🏗️ Project Structure

```
Backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── cors.ts
│   │   ├── logger.ts
│   │   ├── rateLimit.ts
│   │   └── supabase.ts
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── battle.controller.ts
│   │   ├── problem.controller.ts
│   │   ├── submission.controller.ts
│   │   ├── tournament.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── notFoundHandler.ts
│   │   └── validation.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── battle.routes.ts
│   │   ├── problem.routes.ts
│   │   ├── submission.routes.ts
│   │   ├── tournament.routes.ts
│   │   └── user.routes.ts
│   ├── services/        # Business logic
│   │   ├── codeExecution.service.ts
│   │   └── redis.service.ts
│   ├── sockets/         # WebSocket handlers
│   │   └── index.ts
│   ├── validators/      # Zod schemas
│   │   ├── auth.validator.ts
│   │   ├── battle.validator.ts
│   │   ├── problem.validator.ts
│   │   ├── submission.validator.ts
│   │   ├── tournament.validator.ts
│   │   └── user.validator.ts
│   └── server.ts        # Entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t ets-prep-backend .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

## 📊 Monitoring & Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Zod schema validation
- **JWT Authentication**: Secure token-based auth
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

## 🚀 Performance Optimizations

- **Redis Caching**: Session and leaderboard caching
- **Database Indexing**: Optimized queries
- **Compression**: Response compression
- **Connection Pooling**: Database connection management
- **Async Code Execution**: Non-blocking code evaluation

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3001 |
| `SUPABASE_URL` | Supabase project URL | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | - |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `CODE_EXECUTION_TIMEOUT` | Code execution timeout (ms) | 10000 |
| `MAX_MEMORY_MB` | Max memory for code execution | 256 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License

## 👥 Support

For support, email support@etsprep.com or join our Discord server.

## 🎯 Roadmap

- [ ] AI-powered problem generation
- [ ] Code review system
- [ ] Mobile app support
- [ ] Video tutorials integration
- [ ] Peer-to-peer code review
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] AWS Lambda code execution
- [ ] GraphQL API
- [ ] Microservices architecture

---

Built with ❤️ by the ETS PREP Team
