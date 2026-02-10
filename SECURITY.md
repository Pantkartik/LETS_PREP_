# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please email security@lets-prep.com or create a private security advisory on GitHub.

**DO NOT** create a public issue for security vulnerabilities.

## Security Measures Implemented

### 1. Environment Variables
- All sensitive keys stored in `.env` files (gitignored)
- No hardcoded API keys or secrets in source code
- Separate environment files for development and production

### 2. Code Execution Security
- **Docker Isolation**: All user code runs in isolated containers
- **Resource Limits**: CPU (1 core), Memory (256MB default), Time limits enforced
- **Network Isolation**: Containers have no network access (`NetworkMode: 'none'`)
- **Capability Dropping**: All Linux capabilities dropped (`CapDrop: ['ALL']`)
- **No Privilege Escalation**: `no-new-privileges` security option enabled
- **Seccomp Profile**: Syscall filtering via `seccomp_profile.json`
- **Read-only Root**: Container filesystem is read-only where possible
- **Automatic Cleanup**: Containers and temporary files deleted after execution

### 3. API Security
- Rate limiting on all endpoints
- CORS configuration for allowed origins
- Input validation using Zod schemas
- SQL injection prevention via Supabase parameterized queries
- XSS protection via Content Security Policy headers

### 4. Authentication & Authorization
- JWT-based authentication
- Supabase Row Level Security (RLS) policies
- Service role keys only used server-side
- Anon keys for client-side (limited permissions)

### 5. Database Security
- Row Level Security (RLS) enabled on all tables
- Encrypted connections (SSL/TLS)
- Prepared statements prevent SQL injection
- Sensitive data encrypted at rest

### 6. Dependencies
- Regular dependency audits via `npm audit`
- Automated security updates via Dependabot
- Minimal dependency footprint

## Security Checklist Before Deployment

- [ ] All `.env` files are gitignored
- [ ] No API keys in source code
- [ ] Docker daemon is secured
- [ ] Rate limiting is configured
- [ ] CORS origins are restricted
- [ ] Database RLS policies are active
- [ ] SSL/TLS certificates are valid
- [ ] Secrets are stored in environment variables or secret manager
- [ ] Security headers are configured (CSP, HSTS, etc.)
- [ ] Input validation is comprehensive
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include secrets

## Secure Development Practices

1. **Never commit**:
   - `.env` files
   - API keys or tokens
   - Private keys
   - Database credentials
   - Session secrets

2. **Always use**:
   - Environment variables for secrets
   - Parameterized queries
   - Input validation
   - HTTPS in production
   - Secure headers

3. **Regular audits**:
   - Run `npm audit` weekly
   - Review dependencies monthly
   - Update security patches immediately
   - Scan for secrets with tools like `git-secrets`

## Incident Response

If a security breach occurs:

1. **Immediate**: Rotate all compromised credentials
2. **Within 1 hour**: Assess impact and contain breach
3. **Within 24 hours**: Notify affected users
4. **Within 1 week**: Publish post-mortem and remediation plan

## Contact

Security Team: security@lets-prep.com
