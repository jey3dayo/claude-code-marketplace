#!/bin/bash
# setup-dotenvx.sh - Initialize dotenvx for a new project
#
# Usage: ./setup-dotenvx.sh [environment]
# Example: ./setup-dotenvx.sh production

set -euo pipefail

ENVIRONMENT="${1:-production}"
ENV_FILE=".env.${ENVIRONMENT}"

echo "🔧 Setting up dotenvx for ${ENVIRONMENT} environment..."

# Step 1: Install dotenvx
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "📦 Installing @dotenvx/dotenvx..."
npm install --save-dev @dotenvx/dotenvx

# Step 2: Setup .gitignore
echo "📝 Configuring .gitignore..."
if [ ! -f .gitignore ]; then
    touch .gitignore
fi

# Add dotenvx-specific entries if not already present
if ! grep -q ".env.keys" .gitignore 2>/dev/null; then
    cat >> .gitignore <<EOF

# dotenvx encryption keys (NEVER commit)
.env.keys
.env.vault

# Environment files (sensitive data)
.env
.env.*
!.env.test
!.env.*.example
EOF
    echo "✅ Added dotenvx entries to .gitignore"
else
    echo "ℹ️  .gitignore already contains dotenvx entries"
fi

# Step 3: Create environment file if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo "📄 Creating $ENV_FILE..."
    cat > "$ENV_FILE" <<EOF
# ${ENVIRONMENT} environment variables
# Add your secrets here, then run: npx dotenvx encrypt -f $ENV_FILE

# Example variables:
# DATABASE_URL=postgres://user:password@localhost:5432/mydb
# API_KEY=your-api-key-here
# AWS_SECRET_ACCESS_KEY=your-aws-secret
EOF
    echo "✅ Created $ENV_FILE"
    echo "ℹ️  Edit $ENV_FILE and add your environment variables"
else
    echo "ℹ️  $ENV_FILE already exists, skipping creation"
fi

# Step 4: Show next steps
echo ""
echo "✨ Setup complete! Next steps:"
echo ""
echo "1. Edit $ENV_FILE and add your environment variables"
echo "2. Encrypt the file: npx dotenvx encrypt -f $ENV_FILE"
echo "3. Commit the encrypted file: git add $ENV_FILE && git commit -m 'feat: add encrypted ${ENVIRONMENT} env'"
echo "4. Securely store .env.keys (1Password, Vault, etc.)"
echo "5. Run your app: npx dotenvx run -f $ENV_FILE -- <your-command>"
echo ""
echo "⚠️  IMPORTANT: Never commit .env.keys to git!"
