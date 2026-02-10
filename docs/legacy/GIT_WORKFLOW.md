# 🌳 Git Branching Strategy & Workflow

## 📋 Branch Structure (Git Flow)

### **Main Branches**

1. **`main`** (Production)
   - Always stable and deployable
   - Protected branch (requires PR + reviews)
   - Auto-deploys to production
   - Only accepts merges from `release/*` or `hotfix/*`

2. **`develop`** (Development)
   - Integration branch for features
   - Pre-production testing
   - Auto-deploys to staging environment
   - Base branch for all feature development

### **Supporting Branches**

3. **`feature/*`** (Feature Development)
   - Format: `feature/issue-number-short-description`
   - Examples:
     - `feature/123-multi-language-support`
     - `feature/456-code-execution-optimization`
   - Branch from: `develop`
   - Merge back to: `develop`
   - Deleted after merge

4. **`bugfix/*`** (Bug Fixes)
   - Format: `bugfix/issue-number-short-description`
   - Examples:
     - `bugfix/789-auth-token-missing`
     - `bugfix/101-console-error-fix`
   - Branch from: `develop`
   - Merge back to: `develop`

5. **`hotfix/*`** (Production Hotfixes)
   - Format: `hotfix/version-issue-description`
   - Examples:
     - `hotfix/1.2.1-critical-auth-bug`
   - Branch from: `main`
   - Merge back to: `main` AND `develop`
   - For critical production bugs only

6. **`release/*`** (Release Preparation)
   - Format: `release/version-number`
   - Examples:
     - `release/1.0.0`
     - `release/2.1.0`
   - Branch from: `develop`
   - Merge to: `main` AND `develop`
   - For final testing and version bumps

---

## 🔄 Workflow

### **1. Starting New Feature**

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/123-your-feature-name

# Work on your feature
# ... make changes ...

# Commit with conventional commits
git add .
git commit -m "feat: add multi-language code execution support"

# Push to remote
git push -u origin feature/123-your-feature-name

# Create Pull Request on GitHub
# develop ← feature/123-your-feature-name
```

### **2. Bug Fix**

```bash
# Create bugfix branch from develop
git checkout develop
git pull origin develop
git checkout -b bugfix/456-fix-auth-error

# Fix the bug
# ... make changes ...

# Commit
git commit -m "fix: resolve authentication token issue"

# Push and create PR
git push -u origin bugfix/456-fix-auth-error
```

### **3. Hotfix (Production Emergency)**

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/1.0.1-critical-bug

# Fix the critical issue
# ... make changes ...

# Commit
git commit -m "fix(critical): resolve production authentication failure"

# Push
git push -u origin hotfix/1.0.1-critical-bug

# Create TWO PRs:
# 1. main ← hotfix/1.0.1-critical-bug
# 2. develop ← hotfix/1.0.1-critical-bug
```

### **4. Release**

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/1.0.0

# Update version numbers
# Update CHANGELOG.md
# Final testing

# Commit
git commit -m "chore: bump version to 1.0.0"

# Push
git push -u origin release/1.0.0

# Create PR: main ← release/1.0.0
# After merge to main, also merge back to develop
```

---

## 📝 Commit Message Convention (Conventional Commits)

### **Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

### **Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling
- `ci`: CI/CD changes
- `revert`: Revert previous commit

### **Examples:**

```bash
# Feature
git commit -m "feat(executor): add Python and C++ code execution support"

# Bug fix
git commit -m "fix(auth): add missing authentication token to backend requests"

# Performance
git commit -m "perf(executor): optimize code execution with parallel processing"

# Documentation
git commit -m "docs: add multi-language support guide"

# Breaking change
git commit -m "feat(api)!: change submission endpoint structure

BREAKING CHANGE: Submission API now requires authentication token"
```

---

## 🔒 Branch Protection Rules

### **`main` Branch:**
- ✅ Require pull request reviews (minimum 1)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require linear history
- ✅ Include administrators
- ❌ Allow force pushes
- ❌ Allow deletions

### **`develop` Branch:**
- ✅ Require pull request reviews (minimum 1)
- ✅ Require status checks to pass
- ❌ Allow force pushes
- ❌ Allow deletions

---

## 📊 Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

---

## 🏷️ Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (2.0.0)
- **MINOR**: New features, backward compatible (1.1.0)
- **PATCH**: Bug fixes, backward compatible (1.0.1)

Examples:
- `1.0.0` - Initial release
- `1.1.0` - Added multi-language support
- `1.1.1` - Fixed authentication bug
- `2.0.0` - Breaking API changes

---

## 🚀 Deployment Strategy

### **Environments:**

1. **Development** (`develop` branch)
   - Auto-deploy to dev environment
   - Continuous integration
   - Latest features

2. **Staging** (`release/*` branches)
   - Pre-production testing
   - QA environment
   - Final validation

3. **Production** (`main` branch)
   - Auto-deploy to production
   - Stable releases only
   - Tagged with version numbers

---

## 📋 Quick Reference

### **Daily Development:**
```bash
# Start work
git checkout develop
git pull origin develop
git checkout -b feature/your-feature

# During work
git add .
git commit -m "feat: your message"
git push

# End of feature
# Create PR: develop ← feature/your-feature
```

### **Emergency Fix:**
```bash
git checkout main
git pull origin main
git checkout -b hotfix/1.0.1-issue
# Fix, commit, push
# Create PR: main ← hotfix/1.0.1-issue
```

---

## 🎯 Best Practices

1. **Always pull before creating new branch**
2. **Keep commits atomic and focused**
3. **Write descriptive commit messages**
4. **Create PR early for feedback**
5. **Keep PRs small and reviewable**
6. **Delete branches after merge**
7. **Tag releases on main**
8. **Never commit sensitive data**
9. **Use .gitignore properly**
10. **Rebase feature branches regularly**

---

**Follow this workflow for professional, production-ready version control! 🚀**
