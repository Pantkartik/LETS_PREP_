# ETS PREP DSA Battles - Complete Backend Architecture

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile App  │  │  Admin Panel │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │ HTTP/WebSocket   │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway / Load Balancer                 │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Server (Node.js/Express)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   REST API   │  │  WebSocket   │  │  Auth Layer  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Battle     │  │   Code Exec  │  │   Problem    │          │
│  │   Service    │  │   Service    │  │   Service    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │    Docker    │          │
│  │  (Supabase)  │  │   (Cache)    │  │  (Execution) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

### Core Tables

#### 1. **profiles** - User Information
- Stores user data, statistics, and preferences
- Linked to Supabase Auth
- Tracks XP, level, wins, losses, streaks

#### 2. **problems** - DSA Problems
- Problem details, test cases, starter code
- Multi-language support
- Difficulty levels and categories
- Acceptance rates and statistics

#### 3. **battles** - Game Rooms
- Battle configuration and status
- Room codes for joining
- Public/Private/Practice modes
- Time limits and participant counts

#### 4. **battle_participants** - Battle Membership
- User participation in battles
- Submission tracking
- Scores and rankings
- Join/leave timestamps

#### 5. **submissions** - Code Submissions
- User code submissions
- Execution results and test case outcomes
- Performance metrics (time, memory)
- Best submission tracking

#### 6. **tournaments** - Competitive Events
- Tournament configuration
- Registration periods
- Prize pools
- Tournament types (elimination, round-robin, swiss)

#### 7. **achievements** - Gamification
- Achievement definitions
- Unlock criteria
- Points and rarity levels

#### 8. **chat_messages** - Battle Chat
- Real-time messaging
- Message types (text, system, code)
- Soft deletion support

### Database Triggers & Functions

1. **update_battle_participant_count()** - Auto-update player counts
2. **update_user_stats_on_battle_complete()** - Update user statistics
3. **update_problem_stats()** - Track problem acceptance rates
4. **generate_room_code()** - Generate unique 6-character codes
5. **refresh_global_leaderboard()** - Update materialized view

## 🔐 Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. POST /auth/register or /auth/login
     ▼
┌────────────────┐
│  Auth Service  │
└────┬───────────┘
     │
     │ 2. Verify with Supabase Auth
     ▼
┌────────────────┐
│  Supabase Auth │
└────┬───────────┘
     │
     │ 3. Return JWT Token
     ▼
┌────────────────┐
│  Client        │ Store token
└────┬───────────┘
     │
     │ 4. Subsequent requests with Bearer token
     ▼
┌────────────────┐
│  Auth          │ Verify token
│  Middleware    │ Attach user to request
└────────────────┘
```

## ⚡ Real-Time Battle Flow

```
1. User creates battle → Battle record created → Room code generated
2. Users join via room code → battle_participants record created
3. Creator starts battle → Status: WAITING → ACTIVE
4. WebSocket connections established
5. Users submit code → Async execution → Results broadcast
6. Leaderboard updates in real-time via Redis
7. Battle ends → Final rankings → XP/achievements awarded
```

## 🐳 Code Execution Pipeline

```
┌──────────────────┐
│  Submit Code     │
└────┬─────────────┘
     │
     │ 1. Create submission record (status: PENDING)
     ▼
┌──────────────────┐
│  Queue for       │
│  Execution       │
└────┬─────────────┘
     │
     │ 2. Update status: RUNNING
     ▼
┌──────────────────┐
│  Docker          │
│  Container       │
│  - Python        │
│  - Java          │
│  - C++           │
│  - JavaScript    │
└────┬─────────────┘
     │
     │ 3. Execute with resource limits
     │    - Time: 10s max
     │    - Memory: 256MB max
     │    - Network: Disabled
     ▼
┌──────────────────┐
│  Test Cases      │
│  Evaluation      │
└────┬─────────────┘
     │
     │ 4. Compare outputs
     ▼
┌──────────────────┐
│  Update          │
│  Submission      │
│  - Status        │
│  - Results       │
│  - Score         │
└────┬─────────────┘
     │
     │ 5. Broadcast results via WebSocket
     ▼
┌──────────────────┐
│  Update          │
│  Leaderboard     │
└──────────────────┘
```

## 🔄 WebSocket Event Flow

### Battle Events
- `battle:join` → User joins battle room
- `battle:user_joined` → Broadcast to all participants
- `battle:ready` → User marks as ready
- `battle:start_coding` → User starts coding
- `battle:typing` → Typing indicator
- `battle:submit` → Code submission
- `battle:user_submitted` → Broadcast submission
- `battle:leaderboard_updated` → Real-time rankings

### Chat Events
- `chat:message` → Send message
- `chat:new_message` → Broadcast message
- `chat:typing` → Typing indicator

## 📊 Caching Strategy (Redis)

### Cache Keys

```
# User Sessions
session:{userId} → User session data (24h TTL)

# Battle State
battle:{battleId}:state → Current battle state (1h TTL)
battle:{battleId}:users → Set of active users
battle:{battleId}:leaderboard → Sorted set for rankings

# Rate Limiting
ratelimit:{ip}:{endpoint} → Request count (15min window)

# Leaderboards
leaderboard:global → Global user rankings
leaderboard:battle:{battleId} → Battle-specific rankings
```

## 🛡️ Security Measures

### 1. **Authentication**
- JWT tokens with expiration
- Refresh token rotation
- Supabase Auth integration

### 2. **Authorization**
- Role-based access control (STUDENT, TEACHER, ADMIN)
- Resource ownership validation
- Row-level security (RLS) in database

### 3. **Input Validation**
- Zod schema validation
- SQL injection prevention
- XSS protection

### 4. **Rate Limiting**
- Global: 100 requests / 15 minutes
- Auth endpoints: 5 requests / 15 minutes
- Code submission: 10 requests / minute

### 5. **Code Execution Security**
- Sandboxed Docker containers
- No network access
- Resource limits (CPU, memory, time)
- Isolated file system

## 📈 Performance Optimizations

### 1. **Database**
- Indexed columns for frequent queries
- Materialized views for leaderboards
- Connection pooling
- Query optimization

### 2. **Caching**
- Redis for session management
- Leaderboard caching
- Battle state caching
- Frequently accessed data

### 3. **Code Execution**
- Async execution (non-blocking)
- Container reuse
- Parallel test case execution
- Result streaming

### 4. **API**
- Response compression
- Pagination for large datasets
- Selective field loading
- ETags for caching

## 🔍 Monitoring & Logging

### Log Levels
- **ERROR**: System errors, exceptions
- **WARN**: Warnings, deprecated usage
- **INFO**: General information, user actions
- **DEBUG**: Detailed debugging information

### Metrics to Track
- API response times
- Code execution times
- WebSocket connection count
- Active battles
- Submission success rate
- Database query performance
- Redis cache hit rate

## 🚀 Deployment Architecture

### Development
```
Local Machine
├── Node.js Server (port 3001)
├── Redis (port 6379)
└── Docker (code execution)
```

### Production
```
Cloud Infrastructure
├── Load Balancer
├── Backend Servers (Auto-scaling)
│   ├── Node.js instances
│   └── WebSocket servers
├── Redis Cluster (High availability)
├── PostgreSQL (Supabase)
└── Docker Swarm / Kubernetes (Code execution)
```

## 📦 API Response Format

### Success Response
```json
{
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "statusCode": 400
}
```

## 🎯 Future Enhancements

1. **Microservices Architecture**
   - Separate services for battles, problems, execution
   - Service mesh (Istio)
   - API Gateway (Kong, AWS API Gateway)

2. **Scalability**
   - Horizontal scaling with Kubernetes
   - Database sharding
   - CDN for static assets
   - Message queue (RabbitMQ, Kafka)

3. **Advanced Features**
   - AI-powered problem generation
   - Code review and suggestions
   - Video tutorials integration
   - Peer programming sessions
   - Advanced analytics dashboard

4. **Performance**
   - GraphQL API
   - Server-side rendering
   - Edge computing
   - WebAssembly for code execution

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Maintained by**: ETS PREP Team
