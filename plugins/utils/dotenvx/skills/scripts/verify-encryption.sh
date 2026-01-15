#!/bin/bash
# verify-encryption.sh - Verify dotenvx encryption status
#
# Usage: ./verify-encryption.sh [environment]
# Example: ./verify-encryption.sh production
#
# Checks:
# - File encryption status
# - Key availability
# - Decryption capability
# - .gitignore configuration

set -euo pipefail

ENVIRONMENT="${1:-production}"
ENV_FILE=".env.${ENVIRONMENT}"
EXIT_CODE=0

echo "🔍 Verifying dotenvx encryption for ${ENVIRONMENT}..."
echo ""

# Check 1: Environment file exists
echo "1️⃣  Checking if $ENV_FILE exists..."
if [ -f "$ENV_FILE" ]; then
    echo "   ✅ $ENV_FILE found"
else
    echo "   ❌ $ENV_FILE not found"
    EXIT_CODE=1
fi
echo ""

# Check 2: File is encrypted
echo "2️⃣  Checking if $ENV_FILE is encrypted..."
if [ -f "$ENV_FILE" ]; then
    FIRST_LINE=$(head -n 1 "$ENV_FILE")
    if [[ "$FIRST_LINE" == *"DOTENV_PUBLIC_KEY"* ]]; then
        echo "   ✅ File is encrypted (detected DOTENV_PUBLIC_KEY header)"
    else
        echo "   ⚠️  File appears to be plaintext (no encryption header)"
        echo "   💡 Encrypt with: npx dotenvx encrypt -f $ENV_FILE"
        EXIT_CODE=1
    fi
else
    echo "   ⏭️  Skipping (file not found)"
fi
echo ""

# Check 3: .env.keys exists
echo "3️⃣  Checking if .env.keys exists..."
if [ -f ".env.keys" ]; then
    echo "   ✅ .env.keys found"

    # Check if environment-specific key exists
    KEY_VAR="DOTENV_PRIVATE_KEY_${ENVIRONMENT^^}"
    if grep -q "^${KEY_VAR}=" .env.keys; then
        echo "   ✅ Found key: ${KEY_VAR}"
    else
        echo "   ⚠️  Key not found: ${KEY_VAR}"
        EXIT_CODE=1
    fi
else
    echo "   ❌ .env.keys not found"
    echo "   💡 Generate keys with: npx dotenvx encrypt -f $ENV_FILE"
    EXIT_CODE=1
fi
echo ""

# Check 4: .gitignore configuration
echo "4️⃣  Checking .gitignore configuration..."
if [ -f ".gitignore" ]; then
    MISSING=()

    if ! grep -q ".env.keys" .gitignore; then
        MISSING+=(".env.keys")
    fi

    if ! grep -q ".env.vault" .gitignore; then
        MISSING+=(".env.vault")
    fi

    if [ ${#MISSING[@]} -eq 0 ]; then
        echo "   ✅ .gitignore properly configured"
    else
        echo "   ⚠️  Missing entries in .gitignore: ${MISSING[*]}"
        echo "   💡 Add with: echo '.env.keys' >> .gitignore"
        EXIT_CODE=1
    fi
else
    echo "   ⚠️  .gitignore not found"
    EXIT_CODE=1
fi
echo ""

# Check 5: Decryption test
echo "5️⃣  Testing decryption capability..."
if [ -f "$ENV_FILE" ] && [ -f ".env.keys" ]; then
    if npx dotenvx run -f "$ENV_FILE" -- true 2>/dev/null; then
        echo "   ✅ Decryption successful"
    else
        echo "   ❌ Decryption failed"
        echo "   💡 Possible causes:"
        echo "      - Key mismatch between .env.keys and $ENV_FILE"
        echo "      - Corrupted encryption"
        echo "      - Wrong environment name"
        EXIT_CODE=1
    fi
else
    echo "   ⏭️  Skipping (missing files)"
fi
echo ""

# Check 6: Variable count
echo "6️⃣  Analyzing encrypted variables..."
if [ -f "$ENV_FILE" ]; then
    VAR_COUNT=$(grep -c "encrypted:" "$ENV_FILE" 2>/dev/null || echo "0")
    if [ "$VAR_COUNT" -gt 0 ]; then
        echo "   ✅ Found ${VAR_COUNT} encrypted variables"
    else
        echo "   ⚠️  No encrypted variables found"
        echo "   💡 File may be plaintext or empty"
    fi
else
    echo "   ⏭️  Skipping (file not found)"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All checks passed! Encryption is properly configured."
else
    echo "⚠️  Some checks failed. Review the issues above."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit $EXIT_CODE
