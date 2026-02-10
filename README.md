# LETS_PREP_ - Production-Grade Online Judge Platform

A secure, scalable online coding platform with real-time code execution, competitive programming features, and classroom management.

## 🚀 Features

### Core Features
- ✅ **Secure Code Execution**: Docker-isolated execution for C++, Python, Java, JavaScript
- ✅ **30+ LeetCode-style Problems**: Comprehensive test cases for each problem
- ✅ **Real-time Leaderboards**: Live competition tracking
- ✅ **Classroom Management**: Teacher dashboards, student progress tracking
- ✅ **Battle Mode**: 1v1 coding competitions
- ✅ **Competition System**: Timed contests with rankings

### Security Features
- 🔒 **Docker Isolation**: Each submission runs in isolated container
- 🔒 **Resource Limits**: CPU, Memory, Time constraints enforced
- 🔒 **Network Isolation**: Containers have no network access
- 🔒 **Seccomp Filtering**: Syscall restrictions via seccomp profile
- 🔒 **No Privilege Escalation**: Security hardening enabled
- 🔒 **Automatic Cleanup**: Containers destroyed after execution

### Technical Highlights
- ⚡ **Template Engine**: Auto-generates input parsing for C++ signatures
- ⚡ **Validation Modes**: Exact match, floating-point (epsilon), custom validators
- ⚡ **Async Execution**: Bull queue for background job processing
- ⚡ **Real-time Updates**: WebSocket support for live competitions
- ⚡ **Row Level Security**: Supabase RLS for data protection

## 📁 Project Structure

```
LETS_PREP_/
├── Backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── services/
│   │   │   ├── execution/   # Code execution engine
│   │   │   │   ├── IsolationManager.ts
│   │   │   │   ├── TemplateEngine.ts
│   │   │   │   └── Validator.ts
│   │   │   └── codeExecution.service.ts
│   │   ├── controllers/     # API controllers
│   │   ├── routes/          # API routes
│   │   └── definitions/     # Language configs
│   ├── scripts/             # Utility scripts
│   └── seccomp_profile.json # Security profile
├── Frontend/                # Next.js 16 + React
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   └── supabase/            # Database migrations
└── .github/
    └── workflows/           # CI/CD pipelines
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Queue**: Bull (Redis)
- **Execution**: Docker + Dockerode
- **Validation**: Zod
- **Auth**: JWT + Supabase Auth

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS
- **Components**: Radix UI + shadcn/ui
- **Code Editor**: Monaco Editor
- **State**: React Hooks
- **Auth**: Supabase Auth

### DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Security**: TruffleHog, Dependabot, CodeRabbit
- **Monitoring**: Vercel Analytics (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git
- Supabase account

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/LETS_PREP_.git
cd LETS_PREP_
```

### 2. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# Get from: https://app.supabase.com/project/_/settings/api

# Pull Docker images for code execution
npx ts-node pull_images.ts

# Start development server
npm run dev
```

Backend runs on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

### 4. Database Setup

1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order:
   - `Frontend/supabase/complete_setup.sql`
   - `Frontend/supabase/add_all_testcases.sql`

### 5. Verify Installation

```bash
cd Backend
npx ts-node verify_engine.ts
```

Should output: ✅ All tests passed

## 📚 Documentation

- **[📚 Setup Guide](docs/setup/QUICK_SETUP.md)** - Installation and configuration
- **[🚀 Deployment Guide](docs/deployment/DEPLOYMENT.md)** - Production deployment instructions
- **[🔒 Security Policy](SECURITY.md)** - Security measures and reporting
- **[🛡️ Security Audit](docs/security/SECURITY_AUDIT_REPORT.md)** - Latest vulnerability assessment
- **[✅ push Checklist](docs/deployment/PRE_PUSH_CHECKLIST.md)** - Pre-commit verification
- **[🧪 Test Cases](docs/testing/TEST_CASE_MANAGEMENT.md)** - Adding and managing test cases
- **[🏗️ Architecture](docs/architecture/ARCHITECTURE.md)** - System design and data flow
- **[✨ Features](docs/features/FEATURES_IMPLEMENTED.md)** - Detailed feature documentation

## 🔒 Security

This project implements industry-standard security practices:

- ✅ No secrets in source code
- ✅ Environment variables for all credentials
- ✅ Docker isolation for untrusted code
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Automated security audits

**Found a security vulnerability?** Email: security@lets-prep.com

## 🧪 Testing

### Run Tests

```bash
# Backend unit tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test

# E2E tests
npm run test:e2e
```

### Test Code Execution

```bash
cd Backend
npx ts-node test_find_k_closest.ts
```

## 📦 Deployment

### Vercel (Frontend)

```bash
cd Frontend
npx vercel
```

### Railway (Backend)

```bash
cd Backend
railway init
railway up
```

### Docker Compose

```bash
docker-compose up -d
```

See **[GITHUB_PUSH_GUIDE.md](GITHUB_PUSH_GUIDE.md)** for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

**Note**: All PRs are automatically reviewed by CodeRabbit AI.

## 📝 Environment Variables

### Backend (.env)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
DOCKER_ENABLED=true
```

See `.env.example` for complete list.

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🏗️ Architecture

### Code Execution Flow

```
User Code → API → Queue → Worker → IsolationManager → Docker Container
                                                            ↓
Expected Output ← Validator ← TemplateEngine ← Container Output
```

### Security Layers

1. **Input Validation**: Zod schemas
2. **Template Injection**: Safe code wrapping
3. **Docker Isolation**: Container per execution
4. **Resource Limits**: CPU/Memory/Time constraints
5. **Seccomp Profile**: Syscall filtering
6. **Output Validation**: Normalized comparison

## 📊 Performance

- **Execution Time**: ~2-5s per submission (including Docker overhead)
- **Concurrent Executions**: Limited by Docker resources
- **Scalability**: Horizontal scaling via worker nodes
- **Caching**: Template compilation cached

## 🐛 Known Issues

- [ ] Nested vector types not fully supported in C++ parser
- [ ] Python async/await requires special handling
- [ ] Java class name must be "Solution"

See [Issues](https://github.com/YOUR_USERNAME/LETS_PREP_/issues) for full list.

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 👥 Team

- **Developer**: Kartik Pant
- **Security**: kartikpant.kp69@gmail.com
- **Support**:  kartikpant.kp69@gmail.com


## 🙏 Acknowledgments

- LeetCode for problem inspiration
- Supabase for backend infrastructure
- Docker for secure execution environment
- shadcn/ui for beautiful components

---

**⭐ Star this repo if you find it useful!**

**🐛 Report bugs**: [GitHub Issues](https://github.com/YOUR_USERNAME/LETS_PREP_/issues)

**💬 Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/LETS_PREP_/discussions)
