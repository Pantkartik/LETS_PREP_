# Pre-Push Security Checklist

## Before Pushing to GitHub

Run this checklist to ensure no secrets or vulnerabilities are leaked:

### 1. Environment Files Check
```bash
# Ensure .env files are gitignored
git status | grep -E "\.env"
# Should return nothing. If files appear, they're not gitignored!
```

### 2. Secret Scan
```bash
# Scan for hardcoded secrets in staged files
git diff --cached | grep -iE "(api_key|secret|password|token)" 
# Should return nothing or only references to env variables
```

### 3. Dependency Audit
```bash
# Backend
cd Backend
npm audit --audit-level=moderate

# Frontend  
cd ../Frontend
npm audit --audit-level=moderate
```

### 4. Install Pre-commit Hook
```bash
# From project root
cp scripts/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit  # Unix/Mac only
```

### 5. Verify .gitignore
```bash
# Check that sensitive files are ignored
cat .gitignore | grep -E "\.env|node_modules|dist"
```

### 6. Remove Sensitive Data from History (if needed)
```bash
# If you accidentally committed secrets, use BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env files from history
bfg --delete-files .env

# Remove secrets by pattern
bfg --replace-text secrets.txt  # Create secrets.txt with patterns to replace
```

### 7. Test Build
```bash
# Backend
cd Backend
npm run build

# Frontend
cd ../Frontend
npm run build
```

### 8. Final Checks
- [ ] No `.env` files in git status
- [ ] No API keys in source code
- [ ] All secrets use environment variables
- [ ] `.env.example` files are up to date
- [ ] `SECURITY.md` is current
- [ ] Dependencies are audited
- [ ] Pre-commit hook is installed
- [ ] Build succeeds without errors

## Push Commands

```bash
# Add all changes
git add .

# Commit (pre-commit hook will run automatically)
git commit -m "feat: your commit message"

# Push to GitHub
git push origin main
```

## After Push

1. **Enable GitHub Security Features**:
   - Go to Settings → Security → Enable Dependabot alerts
   - Enable Dependabot security updates
   - Enable Secret scanning
   - Enable Code scanning (CodeQL)

2. **Add Repository Secrets** (for CI/CD):
   - Go to Settings → Secrets and variables → Actions
   - Add: `OPENAI_API_KEY` (for CodeRabbit)
   - Add: `SUPABASE_URL` (if needed for tests)
   - Add: `SUPABASE_SERVICE_ROLE_KEY` (if needed for tests)

3. **Configure Branch Protection**:
   - Require pull request reviews
   - Require status checks to pass
   - Require conversation resolution
   - Require signed commits (optional)

## Emergency: If Secrets Were Pushed

1. **Immediately rotate all compromised credentials**:
   - Supabase: Generate new service role key
   - JWT: Generate new secret
   - Any other exposed keys

2. **Remove from Git history**:
   ```bash
   # Use BFG Repo-Cleaner or git filter-branch
   bfg --replace-text secrets.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

3. **Notify team and update documentation**

## Tools for Secret Detection

- **TruffleHog**: `docker run trufflesecurity/trufflehog:latest github --repo https://github.com/your-repo`
- **git-secrets**: `git secrets --scan`
- **detect-secrets**: `detect-secrets scan`

## Contact

Security concerns: security@lets-prep.com
