#!/bin/sh
# Pre-commit hook to prevent committing secrets
# Install: cp scripts/pre-commit.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

echo "🔍 Scanning for secrets before commit..."

# Patterns to search for
PATTERNS=(
    "SUPABASE_SERVICE_ROLE_KEY.*=.*eyJ"
    "JWT_SECRET.*=.*[a-zA-Z0-9]{20,}"
    "API_KEY.*=.*[a-zA-Z0-9]{20,}"
    "PASSWORD.*=.*[a-zA-Z0-9]{8,}"
    "SECRET.*=.*[a-zA-Z0-9]{20,}"
    "TOKEN.*=.*[a-zA-Z0-9]{20,}"
    "private[_-]?key"
    "-----BEGIN.*PRIVATE KEY-----"
)

# Check staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

FOUND_SECRET=0

for FILE in $STAGED_FILES; do
    # Skip binary files
    if file "$FILE" | grep -q "text"; then
        for PATTERN in "${PATTERNS[@]}"; do
            if grep -qE "$PATTERN" "$FILE" 2>/dev/null; then
                echo "❌ Potential secret found in $FILE"
                echo "   Pattern: $PATTERN"
                FOUND_SECRET=1
            fi
        done
    fi
done

# Check for .env files
if echo "$STAGED_FILES" | grep -qE "\.env$|\.env\.local$|\.env\.production$"; then
    echo "❌ Attempting to commit .env file!"
    echo "   .env files should never be committed"
    FOUND_SECRET=1
fi

if [ $FOUND_SECRET -eq 1 ]; then
    echo ""
    echo "🚫 Commit blocked! Secrets detected."
    echo "   Please remove secrets and use environment variables instead."
    echo "   If this is a false positive, use: git commit --no-verify"
    exit 1
fi

echo "✅ No secrets detected. Proceeding with commit."
exit 0
