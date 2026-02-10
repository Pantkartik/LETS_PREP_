# 📁 Backend Project Structure

```
Backend/
│
├── 📄 package.json                    # Dependencies and scripts
├── 📄 tsconfig.json                   # TypeScript configuration
├── 📄 .env.example                    # Environment variables template
├── 📄 .gitignore                      # Git ignore rules
├── 📄 Dockerfile                      # Docker image configuration
├── 📄 docker-compose.yml              # Multi-container setup
│
├── 📚 Documentation/
│   ├── README.md                      # Main documentation
│   ├── ARCHITECTURE.md                # System architecture
│   ├── SETUP.md                       # Setup instructions
│   ├── IMPLEMENTATION_SUMMARY.md      # Feature summary
│   └── QUICK_REFERENCE.md             # Quick reference guide
│
└── src/                               # Source code
    │
    ├── 📄 server.ts                   # Main entry point
    │
    ├── ⚙️ config/                     # Configuration files
    │   ├── cors.ts                    # CORS settings
    │   ├── logger.ts                  # Winston logger
    │   ├── rateLimit.ts               # Rate limiting
    │   └── supabase.ts                # Supabase client
    │
    ├── 🛡️ middleware/                 # Express middleware
    │   ├── auth.ts                    # JWT authentication + RBAC
    │   ├── errorHandler.ts            # Global error handler
    │   ├── notFoundHandler.ts         # 404 handler
    │   └── validation.ts              # Zod validation
    │
    ├── 🔌 sockets/                    # WebSocket handlers
    │   └── index.ts                   # Socket.io events
    │
    ├── 🛠️ services/                   # Business logic
    │   ├── redis.service.ts           # Redis operations
    │   └── codeExecution.service.ts   # Code execution engine
    │
    ├── 🚦 routes/                     # API routes
    │   ├── auth.routes.ts             # Authentication endpoints
    │   ├── battle.routes.ts           # Battle endpoints
    │   ├── problem.routes.ts          # Problem endpoints
    │   ├── submission.routes.ts       # Submission endpoints
    │   ├── user.routes.ts             # User endpoints
    │   └── tournament.routes.ts       # Tournament endpoints
    │
    ├── 🎮 controllers/                # Request handlers
    │   ├── auth.controller.ts         # Auth logic
    │   ├── battle.controller.ts       # Battle logic
    │   ├── problem.controller.ts      # Problem logic
    │   ├── submission.controller.ts   # Submission logic
    │   ├── user.controller.ts         # User logic
    │   └── tournament.controller.ts   # Tournament logic
    │
    └── ✅ validators/                 # Zod schemas
        ├── auth.validator.ts          # Auth validation
        ├── battle.validator.ts        # Battle validation
        ├── problem.validator.ts       # Problem validation
        ├── submission.validator.ts    # Submission validation
        ├── user.validator.ts          # User validation
        └── tournament.validator.ts    # Tournament validation
```

## 📊 File Count by Category

| Category | Files | Purpose |
|----------|-------|---------|
| Configuration | 4 | Server setup and environment |
| Middleware | 4 | Request processing |
| Services | 2 | Business logic |
| Routes | 6 | API endpoints |
| Controllers | 6 | Request handlers |
| Validators | 6 | Input validation |
| WebSocket | 1 | Real-time communication |
| Documentation | 5 | Guides and references |
| **Total** | **34** | **Complete backend** |

## 🗂️ Database Structure

```
Supabase Database/
│
├── 👤 User Management
│   ├── profiles                       # User profiles & stats
│   ├── activity_logs                  # User activity tracking
│   └── notifications                  # User notifications
│
├── 🎯 Problem System
│   ├── problems                       # DSA problems
│   └── submissions                    # Code submissions
│
├── ⚔️ Battle System
│   ├── battles                        # Game rooms
│   ├── battle_participants            # Battle membership
│   └── chat_messages                  # Battle chat
│
├── 🏆 Tournament System
│   ├── tournaments                    # Competitive events
│   └── tournament_participants        # Tournament registration
│
├── 🎖️ Gamification
│   ├── achievements                   # Achievement definitions
│   └── user_achievements              # User achievements
│
└── 📊 Analytics
    └── global_leaderboard             # Materialized view
```

## 🔄 Request Flow

```
Client Request
    ↓
Express Server (server.ts)
    ↓
Middleware Stack
    ├── CORS (cors.ts)
    ├── Body Parser
    ├── Rate Limiter (rateLimit.ts)
    ├── Authentication (auth.ts)
    └── Validation (validation.ts)
    ↓
Routes (*.routes.ts)
    ↓
Controllers (*.controller.ts)
    ↓
Services (*.service.ts)
    ├── Supabase (supabase.ts)
    ├── Redis (redis.service.ts)
    └── Code Execution (codeExecution.service.ts)
    ↓
Response / Error Handler
    ↓
Client Response
```

## 🔌 WebSocket Flow

```
Client Connection
    ↓
Socket.io Server (sockets/index.ts)
    ↓
Authentication Middleware
    ↓
Event Handlers
    ├── Battle Events
    ├── Chat Events
    └── Notification Events
    ↓
Redis Pub/Sub
    ↓
Broadcast to Clients
```

## 🐳 Docker Structure

```
Docker Environment/
│
├── Backend Container
│   ├── Node.js 20 Alpine
│   ├── Express Server
│   └── Socket.io Server
│
├── Redis Container
│   ├── Redis 7 Alpine
│   └── Persistent Volume
│
└── Code Execution Containers
    ├── Python 3.11 Alpine
    ├── Node 20 Alpine
    ├── OpenJDK 17 Alpine
    └── GCC Latest
```

## 📝 Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, metadata |
| `tsconfig.json` | TypeScript compiler options |
| `.env.example` | Environment variables template |
| `Dockerfile` | Docker image build instructions |
| `docker-compose.yml` | Multi-container orchestration |
| `.gitignore` | Files to exclude from Git |

## 🎯 Key Features by File

### server.ts
- Express app initialization
- Socket.io setup
- Middleware configuration
- Route registration
- Graceful shutdown

### redis.service.ts
- Connection management
- Cache operations
- Pub/Sub messaging
- Leaderboard management
- Session storage
- Rate limiting

### codeExecution.service.ts
- Docker container management
- Multi-language support
- Test case evaluation
- Resource limiting
- Error handling

### sockets/index.ts
- WebSocket authentication
- Battle event handling
- Chat system
- Real-time updates
- User presence

## 📊 Lines of Code Estimate

| Component | LOC | Complexity |
|-----------|-----|------------|
| Server & Config | ~500 | Medium |
| Middleware | ~300 | Medium |
| Services | ~800 | High |
| Controllers | ~1,500 | High |
| Routes | ~400 | Low |
| Validators | ~300 | Low |
| WebSocket | ~400 | Medium |
| **Total** | **~4,200** | **High** |

## 🔗 Dependencies Overview

### Core
- express - Web framework
- socket.io - WebSocket
- @supabase/supabase-js - Database client

### Utilities
- zod - Validation
- winston - Logging
- helmet - Security
- cors - CORS handling

### Data
- ioredis - Redis client
- dockerode - Docker API

### Development
- typescript - Type safety
- tsx - TS execution
- eslint - Linting

## 🚀 Startup Sequence

1. Load environment variables
2. Initialize logger
3. Connect to Redis
4. Initialize Supabase client
5. Create Express app
6. Configure middleware
7. Register routes
8. Initialize Socket.io
9. Start HTTP server
10. Setup graceful shutdown

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless server design
- Redis for shared state
- Load balancer ready
- Session management in Redis

### Vertical Scaling
- Async operations
- Connection pooling
- Efficient queries
- Caching strategy

### Code Execution Scaling
- Container pooling
- Queue-based processing
- Resource limits
- Parallel execution

---

**Total Files**: 34  
**Total LOC**: ~4,200+  
**Database Tables**: 13  
**API Endpoints**: 50+  
**WebSocket Events**: 15+  

**Architecture**: Modular, Scalable, Production-Ready
